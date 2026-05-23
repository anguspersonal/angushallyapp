/**
 * POST /api/chat — streaming chat assistant endpoint.
 *
 * High-level flow (design §4, §11):
 *
 *   1. Validate request body (uuid sessionId, message length, history shape).
 *   2. Resolve hashed client IP for abuse tracking and rate limiting.
 *   3. Apply per-IP rate limit (20 req / 5 min, in-memory; FR-RATE-1).
 *   4. Apply per-session message cap (50 user turns; FR-RATE-2).
 *   5. Heuristic-flag the user turn for injection probes (FR-SAFE-3 / Layer 2).
 *   6. Open Anthropic stream; pipe text deltas to SSE in real time.
 *   7. On stream end, emit `done` with usage; only THEN persist both turns
 *      (FR-PERS-3 — DB latency never blocks the user-facing response).
 *
 * Off-allowlist `navigate` paths are dropped server-side before any SSE
 * `tool_use` event is emitted (FR-AGENT-2 / Layer-2 defense in depth).
 * Email fields on `draft_contact_message` proposals are re-validated with
 * a regex; invalid emails are stripped from the proposal but the rest of
 * the draft is forwarded so the user can still pre-fill the form.
 *
 * Persistence is best-effort: `upsertSession`/`writeTurn` log on failure
 * but never throw, by design — see src/lib/chat/persistence.ts.
 *
 * Closes tasks 5.5, 5.7 in docs/chatbotv1/tasks.md.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { Tool } from '@anthropic-ai/sdk/resources/messages';
import { NextResponse, type NextRequest } from 'next/server';

import { hashIp } from '@/lib/chat/ipHash';
import { isLikelyInjection } from '@/lib/chat/injectionPatterns';
import { upsertSession, writeTurn } from '@/lib/chat/persistence';
import { DEFAULT_RATE_LIMIT, consume } from '@/lib/chat/rateLimiter';
import { SSE_HEADERS, createSseStream } from '@/lib/chat/streamServer';
import { buildSystemPrompt } from '@/lib/chat/systemPrompt';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  CHAT_TOOLS,
  isValidEmail,
} from '@/lib/chat/tools';
import { ROUTE_ALLOWLIST } from '@/lib/chat/tools.allowlist.generated';
import type {
  ChatHistoryEntry,
  ChatRequestBody,
  StreamEvent,
  ToolUseRecord,
} from '@/lib/chat/types';

export const runtime = 'nodejs';

// ---------- constants --------------------------------------------------------

const MAX_MESSAGE_LENGTH = 1000; // FR-RATE-3
const PER_SESSION_USER_TURN_CAP = 50; // FR-RATE-2
const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001'; // TC-4 (no extended thinking)
const ANTHROPIC_MAX_TOKENS = 1024;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ---------- IP resolution ----------------------------------------------------

/**
 * Read the client IP from request headers.
 *
 * On Vercel, the inbound `X-Forwarded-For` is stripped/overwritten by the
 * platform before our function is invoked, so the leftmost value is the
 * real client IP. On non-Vercel hosts (and edge runtimes where Vercel
 * does not rewrite headers), the leftmost value can be set by the client
 * itself. If hosting changes, replace this with the rightmost trusted-proxy
 * hop or the platform's equivalent `req.ip` accessor.
 */
function resolveClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

// ---------- request validation ----------------------------------------------

type ValidatedBody = {
  ok: true;
  body: ChatRequestBody;
} | {
  ok: false;
  reason: string;
};

function isHistoryEntry(value: unknown): value is ChatHistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    (entry.role === 'user' || entry.role === 'assistant') &&
    typeof entry.content === 'string'
  );
}

function validateBody(payload: unknown): ValidatedBody {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, reason: 'body must be a JSON object' };
  }
  const raw = payload as Record<string, unknown>;
  const { sessionId, message, history, route } = raw;

  if (typeof sessionId !== 'string' || !UUID_REGEX.test(sessionId)) {
    return { ok: false, reason: 'sessionId must be a uuid' };
  }
  if (typeof message !== 'string' || message.length === 0) {
    return { ok: false, reason: 'message must be a non-empty string' };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, reason: `message must be ≤ ${MAX_MESSAGE_LENGTH} chars` };
  }
  if (!Array.isArray(history) || !history.every(isHistoryEntry)) {
    return { ok: false, reason: 'history must be an array of {role, content}' };
  }
  if (typeof route !== 'string') {
    return { ok: false, reason: 'route must be a string' };
  }

  return {
    ok: true,
    body: {
      sessionId,
      message,
      history: history as ChatHistoryEntry[],
      route,
    },
  };
}

// ---------- per-session message cap -----------------------------------------

async function countUserTurns(sessionId: string): Promise<number> {
  const admin = getSupabaseAdmin();
  if (!admin) return 0; // no DB → no cap; persistence is best-effort
  const { count, error } = await admin
    .schema('chat')
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('role', 'user');
  if (error) {
    console.error('[chat/route] countUserTurns failed', error);
    return 0;
  }
  return count ?? 0;
}

// ---------- tool-use sanitisation -------------------------------------------

const ALLOWED_PATHS = new Set<string>(ROUTE_ALLOWLIST);

/**
 * Coerce a finalised Anthropic tool_use block into our wire-shape
 * `ToolUseRecord`, applying server-side defense:
 *
 *  - `navigate`: off-allowlist paths return null (caller skips the event).
 *  - `draft_contact_message`: invalid `email` is stripped, not rejected.
 *
 * Returns null when the block should be dropped entirely.
 */
function sanitiseToolUse(block: {
  name?: unknown;
  input?: unknown;
}): ToolUseRecord | null {
  const input = (block.input ?? {}) as Record<string, unknown>;

  if (block.name === 'navigate') {
    const path = typeof input.path === 'string' ? input.path : null;
    const label = typeof input.label === 'string' ? input.label : null;
    if (!path || !label) return null;
    if (!ALLOWED_PATHS.has(path)) {
      console.warn(
        `[chat/route] dropping off-allowlist navigate path: ${JSON.stringify(path)}`,
      );
      return null;
    }
    return { name: 'navigate', input: { path, label } };
  }

  if (block.name === 'draft_contact_message') {
    const subject = typeof input.subject === 'string' ? input.subject : null;
    const body = typeof input.body === 'string' ? input.body : null;
    if (!subject || !body) return null;
    const proposal: ToolUseRecord = {
      name: 'draft_contact_message',
      input: { subject, body },
    };
    if (typeof input.name === 'string' && input.name.length > 0) {
      proposal.input.name = input.name;
    }
    if (isValidEmail(input.email)) {
      proposal.input.email = input.email as string;
    } else if (input.email !== undefined) {
      console.warn('[chat/route] dropping invalid email from draft_contact_message');
    }
    return proposal;
  }

  return null;
}

// ---------- SSE helpers ------------------------------------------------------

function randomId(): string {
  // The standard global is fine here; `crypto.randomUUID` works under Node 20+.
  return globalThis.crypto.randomUUID();
}

function streamErrorResponse(event: Extract<StreamEvent, { event: 'error' }>): Response {
  const sse = createSseStream();
  sse.send(event);
  sse.close();
  return new Response(sse.stream, { headers: SSE_HEADERS });
}

// ---------- handler ----------------------------------------------------------

export async function POST(request: NextRequest): Promise<Response> {
  // 1. Parse + validate.
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }
  const validated = validateBody(payload);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.reason }, { status: 400 });
  }
  const { body } = validated;

  // 2. Anthropic config check.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return streamErrorResponse({
      event: 'error',
      data: { code: 'unconfigured', message: 'ANTHROPIC_API_KEY not set' },
    });
  }

  // 3. Resolve hashed IP. If the pepper is missing in dev, fall back to a
  //    stable placeholder rather than 500 — persistence is best-effort and
  //    we'd rather degrade than crash the bot.
  const rawIp = resolveClientIp(request);
  let ipHash: string;
  try {
    ipHash = hashIp(rawIp);
  } catch (err) {
    console.error('[chat/route] ipHash failed — using fallback', err);
    ipHash = `unhashed:${rawIp}`;
  }

  // 4. Rate limit (per-IP, in-memory).
  const rl = consume(ipHash, DEFAULT_RATE_LIMIT);
  if (!rl.allowed) {
    return streamErrorResponse({
      event: 'error',
      data: {
        code: 'rate_limited',
        message: `Easy there — try again in a few seconds.`,
      },
    });
  }

  // 5. Per-session cap.
  const priorUserTurns = await countUserTurns(body.sessionId);
  if (priorUserTurns >= PER_SESSION_USER_TURN_CAP) {
    return streamErrorResponse({
      event: 'error',
      data: {
        code: 'session_cap_reached',
        message: `This session has reached its message cap.`,
      },
    });
  }

  // 6. Layer-2 injection heuristic (flag-only; never block).
  const injectionFlagged = isLikelyInjection(body.message);

  // 7. Idempotent session upsert (writes are best-effort).
  await upsertSession({
    sessionId: body.sessionId,
    anonId: body.sessionId, // anon_id is mirrored from sessionId in v1
    ipHash,
    userAgent: request.headers.get('user-agent') ?? undefined,
    referrer: request.headers.get('referer') ?? undefined,
    firstRoute: body.route || undefined,
  });

  // 8. Open SSE channel and kick off the model stream.
  const sse = createSseStream();
  const messageId = randomId();
  sse.send({
    event: 'ready',
    data: { sessionId: body.sessionId, messageId },
  });

  const startedAt = Date.now();
  const anthropic = new Anthropic({ apiKey });

  // The handler returns the SSE stream immediately; the work continues in
  // this async IIFE so the client gets `ready` without waiting for the
  // first model token.
  void (async () => {
    let assistantText = '';
    const emittedToolUses: ToolUseRecord[] = [];
    let tokensIn = 0;
    let tokensOut = 0;
    let upstreamError = false;

    const upstream = anthropic.messages.stream({
      model: ANTHROPIC_MODEL,
      max_tokens: ANTHROPIC_MAX_TOKENS,
      system: buildSystemPrompt(),
      messages: [
        ...body.history.map((entry) => ({
          role: entry.role,
          content: entry.content,
        })),
        { role: 'user', content: body.message },
      ],
      // The SDK's input type is `ToolUnion[]` (mutable); CHAT_TOOLS is
      // declared `as const` for type-narrowing elsewhere, so we widen
      // via an explicit cast here. The runtime shape is identical.
      tools: CHAT_TOOLS.map((tool) => ({ ...tool })) as unknown as Tool[],
    });

    // Honour abort: cancel the upstream when the client disconnects.
    const onClientAbort = () => {
      try {
        upstream.abort();
      } catch {
        // already torn down — ignore
      }
    };
    request.signal.addEventListener('abort', onClientAbort);

    try {
      // Stream text deltas live. The SDK emits a `text` event with the
      // incremental delta and the running snapshot; we forward just the
      // delta to keep frame size small.
      upstream.on('text', (delta) => {
        assistantText += delta;
        sse.send({ event: 'delta', data: { type: 'text', text: delta } });
      });

      // We rely on `finalMessage()` for the assembled tool_use blocks with
      // fully-parsed JSON inputs; emitting them mid-stream from the raw
      // input_json_delta events would require a JSON-parser-on-partial.
      const finalMessage = await upstream.finalMessage();

      tokensIn = finalMessage.usage?.input_tokens ?? 0;
      tokensOut = finalMessage.usage?.output_tokens ?? 0;

      for (const block of finalMessage.content) {
        if (block.type !== 'tool_use') continue;
        const sanitised = sanitiseToolUse({ name: block.name, input: block.input });
        if (!sanitised) continue;
        emittedToolUses.push(sanitised);
        sse.send({ event: 'tool_use', data: sanitised });
      }
    } catch (err) {
      upstreamError = true;
      console.error('[chat/route] upstream stream failed', err);
      sse.send({
        event: 'error',
        data: {
          code: 'upstream_unavailable',
          message: "I'm having trouble — try again in a moment.",
        },
      });
    } finally {
      request.signal.removeEventListener('abort', onClientAbort);
    }

    if (!upstreamError) {
      sse.send({
        event: 'done',
        data: {
          tokensIn,
          tokensOut,
          latencyMs: Date.now() - startedAt,
        },
      });
    }
    sse.close();

    // Persistence runs AFTER the user-visible `done` (FR-PERS-3). Errors
    // are swallowed inside the helpers; nothing here can fail the request.
    await writeTurn({
      sessionId: body.sessionId,
      role: 'user',
      content: body.message,
      route: body.route || undefined,
      injectionFlagged,
    });
    await writeTurn({
      sessionId: body.sessionId,
      role: 'assistant',
      content: assistantText,
      model: ANTHROPIC_MODEL,
      tokensIn,
      tokensOut,
      latencyMs: Date.now() - startedAt,
      route: body.route || undefined,
      toolName: emittedToolUses[0]?.name,
      toolArgs: emittedToolUses.length > 0 ? emittedToolUses : null,
    });
  })();

  return new Response(sse.stream, { headers: SSE_HEADERS });
}
