/** @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Route-handler smoke + property tests (tasks 5.6, 5.8).
 *
 * The Anthropic SDK is mocked at module level so the test owns the
 * stream timing: emit two text deltas, optionally a tool_use block, and
 * then resolve `finalMessage()`. The persistence module is mocked so
 * we can assert that the route handler:
 *
 *   - persists user + assistant turns ONLY after the SSE `done` (FR-PERS-3)
 *   - drops off-allowlist `navigate` paths before they reach the client (FR-AGENT-2)
 *   - returns 400 (not an SSE error) for malformed request bodies
 */

// ----- mocks ----------------------------------------------------------------

type MockTextHandler = (delta: string) => void;
type MockMessage = {
  content: Array<
    | { type: 'text'; text: string }
    | { type: 'tool_use'; name: string; input: Record<string, unknown> }
  >;
  usage?: { input_tokens?: number; output_tokens?: number };
};

const mockStream = {
  textHandler: null as MockTextHandler | null,
  deltas: [] as string[],
  finalMessage: { content: [], usage: { input_tokens: 0, output_tokens: 0 } } as MockMessage,
  abortCalls: 0,
  /** Captures the args of the last `messages.stream()` call so tests can
   * assert on the system/tools/messages shape (e.g. cache_control). */
  lastStreamArgs: null as Record<string, unknown> | null,
};

function resetMockStream(): void {
  mockStream.textHandler = null;
  mockStream.deltas = [];
  mockStream.finalMessage = { content: [], usage: { input_tokens: 0, output_tokens: 0 } };
  mockStream.abortCalls = 0;
  mockStream.lastStreamArgs = null;
}

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        stream: (args: Record<string, unknown>) => {
          mockStream.lastStreamArgs = args;
          const stream = {
            on: (_event: string, handler: MockTextHandler) => {
              mockStream.textHandler = handler;
              return stream;
            },
            finalMessage: async () => {
              // Flush deltas through the registered handler.
              for (const delta of mockStream.deltas) {
                mockStream.textHandler?.(delta);
              }
              return mockStream.finalMessage;
            },
            abort: () => {
              mockStream.abortCalls += 1;
            },
          };
          return stream;
        },
      };
    },
  };
});

type AnyArgs = unknown[];
const upsertSession = vi.fn<AnyArgs, Promise<void>>(async () => undefined);
const writeTurn = vi.fn<AnyArgs, Promise<void>>(async () => undefined);

vi.mock('@/lib/chat/persistence', () => ({
  upsertSession: (...args: Parameters<typeof upsertSession>) => upsertSession(...args),
  writeTurn: (...args: Parameters<typeof writeTurn>) => writeTurn(...args),
}));

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => null, // no DB in unit tests
}));

vi.mock('@/lib/chat/ipHash', () => ({
  hashIp: (ip: string) => `hashed:${ip}`,
}));

// ----- helpers --------------------------------------------------------------

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.42',
    },
    body: JSON.stringify(body),
  });
}

const VALID_UUID = '11111111-2222-4222-9222-333333333333';

function makeValidBody(
  overrides: Partial<{
    sessionId: string;
    message: string;
    route: string;
    history: unknown[];
    surface: unknown;
  }> = {},
) {
  return {
    sessionId: VALID_UUID,
    message: 'Hello, what is this site about?',
    history: [],
    route: '/',
    ...overrides,
  };
}

async function readSseFrames(res: Response): Promise<Array<{ event: string; data: unknown }>> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  const frames: Array<{ event: string; data: unknown }> = [];
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep = buffer.indexOf('\n\n');
    while (sep !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      let eventName: string | null = null;
      const dataLines: string[] = [];
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim();
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
      }
      if (eventName && dataLines.length > 0) {
        frames.push({ event: eventName, data: JSON.parse(dataLines.join('\n')) });
      }
      sep = buffer.indexOf('\n\n');
    }
  }
  return frames;
}

// ----- tests ----------------------------------------------------------------

describe('POST /api/chat', () => {
  beforeEach(() => {
    resetMockStream();
    upsertSession.mockClear();
    writeTurn.mockClear();
    process.env.ANTHROPIC_API_KEY = 'test-key';
    process.env.CHAT_IP_HASH_PEPPER = 'test-pepper';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('golden path — streams deltas, tool_use, then done; persists after done', async () => {
    mockStream.deltas = ['Hello ', 'world.'];
    mockStream.finalMessage = {
      content: [
        { type: 'text', text: 'Hello world.' },
        { type: 'tool_use', name: 'navigate', input: { path: '/about', label: 'About Angus' } },
      ],
      usage: { input_tokens: 12, output_tokens: 7 },
    };

    const { POST } = await import('./route');
    const res = await POST(makeRequest(makeValidBody()));
    expect(res.headers.get('content-type')).toContain('text/event-stream');

    const frames = await readSseFrames(res);
    const names = frames.map((f) => f.event);
    expect(names[0]).toBe('ready');
    expect(names.filter((n) => n === 'delta')).toHaveLength(2);
    expect(names).toContain('tool_use');
    expect(names[names.length - 1]).toBe('done');

    const toolUseFrame = frames.find((f) => f.event === 'tool_use')!;
    expect(toolUseFrame.data).toMatchObject({
      name: 'navigate',
      input: { path: '/about', label: 'About Angus' },
    });

    // Persistence: both turns written, after `done` was sent.
    expect(upsertSession).toHaveBeenCalledTimes(1);
    expect(writeTurn).toHaveBeenCalledTimes(2);
    const [userCall, assistantCall] = writeTurn.mock.calls;
    expect(userCall[0]).toMatchObject({ role: 'user', content: 'Hello, what is this site about?' });
    expect(assistantCall[0]).toMatchObject({
      role: 'assistant',
      tokensIn: 12,
      tokensOut: 7,
      toolName: 'navigate',
    });
  });

  it('drops off-allowlist navigate paths server-side (FR-AGENT-2)', async () => {
    mockStream.deltas = ['Sure.'];
    mockStream.finalMessage = {
      content: [
        { type: 'text', text: 'Sure.' },
        { type: 'tool_use', name: 'navigate', input: { path: '/not-a-page', label: 'Nope' } },
      ],
      usage: { input_tokens: 1, output_tokens: 1 },
    };

    const { POST } = await import('./route');
    const res = await POST(makeRequest(makeValidBody({ sessionId: '22222222-3333-4333-9333-444444444444' })));
    const frames = await readSseFrames(res);

    expect(frames.filter((f) => f.event === 'tool_use')).toHaveLength(0);
    expect(frames[frames.length - 1].event).toBe('done');

    // Persistence still happens — the assistant message was still produced.
    type WriteTurnArg = { role: 'user' | 'assistant'; toolArgs: unknown };
    const assistantCall = writeTurn.mock.calls.find(
      (c) => (c[0] as WriteTurnArg).role === 'assistant',
    );
    expect(assistantCall).toBeDefined();
    expect((assistantCall![0] as WriteTurnArg).toolArgs).toBeNull();
  });

  it('strips invalid email from draft_contact_message proposals', async () => {
    mockStream.deltas = [];
    mockStream.finalMessage = {
      content: [
        {
          type: 'tool_use',
          name: 'draft_contact_message',
          input: {
            subject: 'Hi',
            body: 'Long enough body line for validation.',
            email: 'not-a-real-email',
          },
        },
      ],
      usage: { input_tokens: 1, output_tokens: 1 },
    };

    const { POST } = await import('./route');
    const res = await POST(makeRequest(makeValidBody({ sessionId: '33333333-4444-4444-9444-555555555555' })));
    const frames = await readSseFrames(res);

    const toolUseFrame = frames.find((f) => f.event === 'tool_use');
    expect(toolUseFrame).toBeDefined();
    const data = toolUseFrame!.data as { input: Record<string, unknown> };
    expect(data.input.email).toBeUndefined();
    expect(data.input.subject).toBe('Hi');
    expect(data.input.body).toContain('Long enough body');
  });

  it('returns 400 for a malformed sessionId', async () => {
    const { POST } = await import('./route');
    const res = await POST(makeRequest({ ...makeValidBody(), sessionId: 'not-a-uuid' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when message exceeds 1000 chars (FR-RATE-3)', async () => {
    const { POST } = await import('./route');
    const res = await POST(makeRequest({ ...makeValidBody(), message: 'x'.repeat(1001) }));
    expect(res.status).toBe(400);
  });

  it('returns an SSE error frame when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { POST } = await import('./route');
    const res = await POST(makeRequest(makeValidBody({ sessionId: '44444444-5555-4555-9555-666666666666' })));
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    const frames = await readSseFrames(res);
    expect(frames).toHaveLength(1);
    expect(frames[0].event).toBe('error');
    expect((frames[0].data as { code: string }).code).toBe('unconfigured');
  });

  it('passes the system prompt with cache_control ephemeral (prompt caching)', async () => {
    mockStream.deltas = ['ok'];
    mockStream.finalMessage = {
      content: [{ type: 'text', text: 'ok' }],
      usage: { input_tokens: 1, output_tokens: 1 },
    };
    const { __resetRateLimiterForTests } = await import('@/lib/chat/rateLimiter');
    __resetRateLimiterForTests();
    const { POST } = await import('./route');
    await POST(makeRequest(makeValidBody({ sessionId: '88888888-9999-4999-9999-aaaaaaaaaaaa' })));

    const args = mockStream.lastStreamArgs!;
    expect(args).toBeDefined();
    // System must be an array of blocks (not a bare string) so cache_control
    // can attach. The block must carry { type: 'ephemeral' } so Anthropic
    // applies prompt caching to the ~10k-token system prefix.
    expect(Array.isArray(args.system)).toBe(true);
    const systemBlocks = args.system as Array<Record<string, unknown>>;
    // First block is the cached static prompt. If the request carried a
    // known route (default valid body has `route: '/'`), a second block
    // appended for page-aware context. Either way the first block carries
    // the ephemeral cache breakpoint — that's what we're asserting here.
    expect(systemBlocks.length).toBeGreaterThanOrEqual(1);
    expect(systemBlocks[0]).toMatchObject({
      type: 'text',
      cache_control: { type: 'ephemeral' },
    });
    expect(typeof systemBlocks[0].text).toBe('string');
    expect((systemBlocks[0].text as string).length).toBeGreaterThan(100);
  });

  it('appends the persona block AFTER the cache breakpoint when the request carries a surface (#139)', async () => {
    mockStream.deltas = ['ok'];
    mockStream.finalMessage = {
      content: [{ type: 'text', text: 'ok' }],
      usage: { input_tokens: 1, output_tokens: 1 },
    };

    // Seed a persona instruction for a test surface, then send a request that
    // carries that surface. The block must be appended as a trailing system
    // block (after the cached static prompt) so the cached prefix is intact.
    const { PERSONA_CHAT_INSTRUCTIONS } = await import('@/lib/chat/personaInstructions');
    const TEST_SURFACE = '__route_test_persona__';
    PERSONA_CHAT_INSTRUCTIONS[TEST_SURFACE] = 'Speak in the test persona voice.';

    const { __resetRateLimiterForTests } = await import('@/lib/chat/rateLimiter');
    __resetRateLimiterForTests();
    const { POST } = await import('./route');
    try {
      await POST(
        makeRequest(
          makeValidBody({
            sessionId: 'a1111111-2222-4222-9222-333333333333',
            // Use a route with no KNOWLEDGE_BY_ROUTE entry so there's no
            // page-context block in the middle — isolates the persona block as
            // the trailing block and pins ordering.
            route: '/__no_known_route__',
            surface: TEST_SURFACE,
          }),
        ),
      );

      const args = mockStream.lastStreamArgs!;
      const systemBlocks = args.system as Array<Record<string, unknown>>;
      // First block: the cached static prompt with the ephemeral breakpoint.
      expect(systemBlocks[0]).toMatchObject({ cache_control: { type: 'ephemeral' } });
      // Last block: the persona block, AFTER the breakpoint, with NO
      // cache_control of its own (so it never moves the breakpoint).
      const lastBlock = systemBlocks[systemBlocks.length - 1];
      expect(systemBlocks.length).toBeGreaterThanOrEqual(2);
      expect(lastBlock.cache_control).toBeUndefined();
      expect(lastBlock.text).toContain('# Persona behaviour');
      expect(lastBlock.text).toContain('Speak in the test persona voice.');
    } finally {
      delete PERSONA_CHAT_INSTRUCTIONS[TEST_SURFACE];
      __resetRateLimiterForTests();
    }
  });

  it('omits the persona block entirely on the no-persona path (current behaviour unchanged) (#139)', async () => {
    mockStream.deltas = ['ok'];
    mockStream.finalMessage = {
      content: [{ type: 'text', text: 'ok' }],
      usage: { input_tokens: 1, output_tokens: 1 },
    };

    const { __resetRateLimiterForTests } = await import('@/lib/chat/rateLimiter');
    __resetRateLimiterForTests();
    const { POST } = await import('./route');
    // No `surface` in the body, and an unknown route → no page context either.
    await POST(
      makeRequest(
        makeValidBody({
          sessionId: 'a2222222-3333-4333-9333-444444444444',
          route: '/__no_known_route__',
        }),
      ),
    );

    const args = mockStream.lastStreamArgs!;
    const systemBlocks = args.system as Array<Record<string, unknown>>;
    // Only the single cached static prompt block — no persona, no page context.
    expect(systemBlocks).toHaveLength(1);
    expect(systemBlocks[0]).toMatchObject({ cache_control: { type: 'ephemeral' } });
    for (const block of systemBlocks) {
      expect(block.text).not.toContain('# Persona behaviour');
    }
    __resetRateLimiterForTests();
  });

  it('rejects a non-string surface as a malformed body (#139)', async () => {
    const { POST } = await import('./route');
    const res = await POST(
      makeRequest({ ...makeValidBody(), surface: 123 }),
    );
    expect(res.status).toBe(400);
  });

  it('emits rate_limited when the per-IP bucket is exhausted (FR-RATE-1)', async () => {
    // Pre-fill the bucket for this IP. The route handler hashes the IP
    // before keying the limiter, and the mocked hashIp produces
    // `hashed:203.0.113.42` for the synthetic IP set in makeRequest().
    const { DEFAULT_RATE_LIMIT, __resetRateLimiterForTests, consume } = await import(
      '@/lib/chat/rateLimiter'
    );
    __resetRateLimiterForTests();
    for (let i = 0; i < DEFAULT_RATE_LIMIT.limit; i++) {
      consume('hashed:203.0.113.42');
    }

    const { POST } = await import('./route');
    const res = await POST(makeRequest(makeValidBody({ sessionId: '55555555-6666-4666-9666-777777777777' })));
    const frames = await readSseFrames(res);
    expect(frames).toHaveLength(1);
    expect(frames[0].event).toBe('error');
    expect((frames[0].data as { code: string }).code).toBe('rate_limited');
    // Anthropic must NOT have been invoked — assert by absence of persistence
    // writes (the route handler only writes after a stream completes).
    expect(writeTurn).not.toHaveBeenCalled();
    __resetRateLimiterForTests();
  });

  it('emits session_cap_reached when the per-session message cap is hit (FR-RATE-2)', async () => {
    // Replace the admin-client mock for THIS test so countUserTurns returns
    // a number >= the cap (50). We re-import after re-mocking so the route
    // module's frozen reference picks up the new mock.
    vi.resetModules();
    vi.doMock('@/lib/supabase/admin', () => ({
      getSupabaseAdmin: () => ({
        schema: () => ({
          from: () => ({
            select: () => ({
              eq: () => ({
                eq: () => Promise.resolve({ count: 50, error: null }),
              }),
            }),
          }),
        }),
      }),
    }));
    // Re-mock the rest of the dependencies so they continue to work after
    // resetModules cleared the mock registry.
    vi.doMock('@/lib/chat/persistence', () => ({
      upsertSession: (...args: Parameters<typeof upsertSession>) => upsertSession(...args),
      writeTurn: (...args: Parameters<typeof writeTurn>) => writeTurn(...args),
    }));
    vi.doMock('@/lib/chat/ipHash', () => ({ hashIp: (ip: string) => `hashed:${ip}` }));

    const { __resetRateLimiterForTests } = await import('@/lib/chat/rateLimiter');
    __resetRateLimiterForTests();

    const { POST } = await import('./route');
    const res = await POST(
      makeRequest(makeValidBody({ sessionId: '66666666-7777-4777-9777-888888888888' })),
    );
    const frames = await readSseFrames(res);
    expect(frames).toHaveLength(1);
    expect(frames[0].event).toBe('error');
    expect((frames[0].data as { code: string }).code).toBe('session_cap_reached');

    vi.doUnmock('@/lib/supabase/admin');
    vi.doUnmock('@/lib/chat/persistence');
    vi.doUnmock('@/lib/chat/ipHash');
  });

  it('emits budget_exhausted when the daily spend cap is over (FR-RATE-4)', async () => {
    vi.resetModules();
    // Force the spend-cap check to short-circuit as "over".
    vi.doMock('@/lib/chat/spendCap', () => ({
      isDailySpendOverCap: () => Promise.resolve(true),
    }));
    vi.doMock('@/lib/chat/persistence', () => ({
      upsertSession: (...args: Parameters<typeof upsertSession>) => upsertSession(...args),
      writeTurn: (...args: Parameters<typeof writeTurn>) => writeTurn(...args),
    }));
    vi.doMock('@/lib/chat/ipHash', () => ({ hashIp: (ip: string) => `hashed:${ip}` }));
    vi.doMock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => null }));

    const { __resetRateLimiterForTests } = await import('@/lib/chat/rateLimiter');
    __resetRateLimiterForTests();

    const { POST } = await import('./route');
    const res = await POST(
      makeRequest(makeValidBody({ sessionId: '77777777-8888-4888-9888-999999999999' })),
    );
    const frames = await readSseFrames(res);
    expect(frames).toHaveLength(1);
    expect(frames[0].event).toBe('error');
    expect((frames[0].data as { code: string }).code).toBe('budget_exhausted');
    // No persistence on a cap-rejected request (the model was never called).
    expect(writeTurn).not.toHaveBeenCalled();

    vi.doUnmock('@/lib/chat/spendCap');
    vi.doUnmock('@/lib/chat/persistence');
    vi.doUnmock('@/lib/chat/ipHash');
    vi.doUnmock('@/lib/supabase/admin');
  });

  it('fails closed with `unconfigured` when ipHash throws (missing pepper) — never persists a raw IP', async () => {
    // Simulate a missing CHAT_IP_HASH_PEPPER: the real hashIp throws. The
    // route must hard-fail with `unconfigured` (mirroring the missing-API-key
    // path) rather than degrading to persisting the raw IP into ip_hash.
    vi.resetModules();
    vi.doMock('@/lib/chat/ipHash', () => ({
      hashIp: () => {
        throw new Error('CHAT_IP_HASH_PEPPER environment variable is not set');
      },
    }));
    vi.doMock('@/lib/chat/persistence', () => ({
      upsertSession: (...args: Parameters<typeof upsertSession>) => upsertSession(...args),
      writeTurn: (...args: Parameters<typeof writeTurn>) => writeTurn(...args),
    }));
    vi.doMock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => null }));

    const { POST } = await import('./route');
    const res = await POST(
      makeRequest(makeValidBody({ sessionId: '99999999-aaaa-4aaa-9aaa-bbbbbbbbbbbb' })),
    );
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    const frames = await readSseFrames(res);
    expect(frames).toHaveLength(1);
    expect(frames[0].event).toBe('error');
    expect((frames[0].data as { code: string }).code).toBe('unconfigured');
    // The raw IP must never reach persistence.
    expect(upsertSession).not.toHaveBeenCalled();
    expect(writeTurn).not.toHaveBeenCalled();

    vi.doUnmock('@/lib/chat/ipHash');
    vi.doUnmock('@/lib/chat/persistence');
    vi.doUnmock('@/lib/supabase/admin');
  });
});

describe('resolveClientIp (X-Forwarded-For trust boundary)', () => {
  function reqWithHeaders(headers: Record<string, string>): NextRequest {
    return new NextRequest('http://localhost/api/chat', { method: 'POST', headers });
  }

  it('prefers the single-value x-real-ip header', async () => {
    const { resolveClientIp } = await import('./route');
    const ip = resolveClientIp(
      reqWithHeaders({
        'x-real-ip': '198.51.100.7',
        'x-forwarded-for': '1.1.1.1, 198.51.100.7',
      }),
    );
    expect(ip).toBe('198.51.100.7');
  });

  it('uses the RIGHTMOST X-Forwarded-For hop (the trusted, platform-appended value)', async () => {
    const { resolveClientIp } = await import('./route');
    // Client-set spoof on the left, Vercel-appended real IP on the right.
    const ip = resolveClientIp(reqWithHeaders({ 'x-forwarded-for': '6.6.6.6, 203.0.113.42' }));
    expect(ip).toBe('203.0.113.42');
  });

  it('does not return the spoofable leftmost X-Forwarded-For entry', async () => {
    const { resolveClientIp } = await import('./route');
    const ip = resolveClientIp(
      reqWithHeaders({ 'x-forwarded-for': 'attacker-spoof, attacker-spoof-2, 203.0.113.42' }),
    );
    expect(ip).not.toBe('attacker-spoof');
    expect(ip).toBe('203.0.113.42');
  });

  it('handles a single-entry X-Forwarded-For', async () => {
    const { resolveClientIp } = await import('./route');
    expect(resolveClientIp(reqWithHeaders({ 'x-forwarded-for': '203.0.113.42' }))).toBe(
      '203.0.113.42',
    );
  });

  it('falls back to "unknown" when no trusted header is present', async () => {
    const { resolveClientIp } = await import('./route');
    expect(resolveClientIp(reqWithHeaders({}))).toBe('unknown');
  });
});
