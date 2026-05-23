import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Server-only Supabase writes for the chatbot. Both functions:
 *
 *  - run with the service-role admin client (RLS bypassed)
 *  - log on failure but **never throw** to the caller — the streaming Route
 *    Handler awaits these only after the SSE `done` event has been sent, so a
 *    failed write must not surface to the user (FR-PERS-3).
 *  - no-op silently when the admin client is unavailable (e.g. missing env in
 *    a partially-configured local dev), matching the pattern set in
 *    src/lib/supabase/admin.ts.
 *
 * See docs/chatbotv1/requirements.md §5.9 and docs/chatbotv1/design.md §8.1.
 */

export type UpsertSessionInput = {
  sessionId: string; // uuid, generated client-side
  anonId: string; // uuid, stored in localStorage on the client
  ipHash: string; // from hashIp(); never raw IP
  userAgent?: string;
  referrer?: string;
  firstRoute?: string;
};

export async function upsertSession(input: UpsertSessionInput): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return;
  }
  try {
    const { error } = await admin
      .schema('chat')
      .from('sessions')
      .upsert(
        {
          id: input.sessionId,
          anon_id: input.anonId,
          ip_hash: input.ipHash,
          user_agent: input.userAgent ?? null,
          referrer: input.referrer ?? null,
          first_route: input.firstRoute ?? null,
        },
        { onConflict: 'id', ignoreDuplicates: true },
      );
    if (error) {
      console.error('[chat/persistence] upsertSession failed', error);
    }
  } catch (err) {
    console.error('[chat/persistence] upsertSession threw', err);
  }
}

export type WriteTurnInput = {
  sessionId: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  model?: string;
  tokensIn?: number;
  tokensOut?: number;
  latencyMs?: number;
  route?: string;
  toolName?: string;
  toolArgs?: unknown;
  injectionFlagged?: boolean;
};

export async function writeTurn(input: WriteTurnInput): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return;
  }
  try {
    const { error } = await admin
      .schema('chat')
      .from('messages')
      .insert({
        session_id: input.sessionId,
        role: input.role,
        content: input.content,
        model: input.model ?? null,
        tokens_in: input.tokensIn ?? null,
        tokens_out: input.tokensOut ?? null,
        latency_ms: input.latencyMs ?? null,
        route: input.route ?? null,
        tool_name: input.toolName ?? null,
        tool_args: (input.toolArgs as object | null | undefined) ?? null,
        injection_flagged: input.injectionFlagged ?? false,
      });
    if (error) {
      console.error('[chat/persistence] writeTurn failed', error);
    }
  } catch (err) {
    console.error('[chat/persistence] writeTurn threw', err);
  }
}
