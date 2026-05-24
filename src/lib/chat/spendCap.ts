import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Daily spend-cap accounting.
 *
 * Sums `tokens_in * input_price + tokens_out * output_price` across
 * `chat.messages` rows for the current UTC day. The aggregate is cached
 * in process memory for 60 seconds so the cap-check itself is cheap
 * (one indexed query per minute per instance).
 *
 *   CHAT_DAILY_SPEND_CAP_USD                  — the cap, e.g. "5"
 *   CHAT_INPUT_PRICE_USD_PER_MILLION_TOKENS   — e.g. "1.00"
 *   CHAT_OUTPUT_PRICE_USD_PER_MILLION_TOKENS  — e.g. "5.00"
 *
 * Worst-case overshoot is one cache window of traffic at peak rate;
 * the per-IP rate limiter bounds that. See design §10.
 *
 * Pure-function helpers (`computeSpendUsd`, `isOverCap`) are exported
 * separately so they can be tested without a Supabase fixture.
 */

const CACHE_TTL_MS = 60_000;

type Cached = { totalUsd: number; cachedAt: number };
let cached: Cached | null = null;

/** Reset the in-memory cache. Test-only. */
export function _resetSpendCapCacheForTests(): void {
  cached = null;
}

export type TokenPair = { tokens_in: number | null; tokens_out: number | null };

export function computeSpendUsd(
  pairs: readonly TokenPair[],
  inputPricePerMillion: number,
  outputPricePerMillion: number,
): number {
  let totalUsd = 0;
  for (const { tokens_in, tokens_out } of pairs) {
    if (tokens_in == null || tokens_out == null) continue;
    totalUsd += (tokens_in * inputPricePerMillion + tokens_out * outputPricePerMillion) / 1_000_000;
  }
  return totalUsd;
}

/**
 * Returns true when `spendUsd` is at or past the cap. The `>=` semantics
 * are deliberate: the cap is the maximum permissible cumulative spend, so
 * the first request that would carry the daily total *up to* the cap also
 * trips it. This errs on the conservative side — better to short-circuit
 * one request early than to allow one overshoot.
 */
export function isOverCap(spendUsd: number, capUsd: number): boolean {
  return spendUsd >= capUsd;
}

function startOfDayUtcIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

/**
 * Today's total spend in USD across all sessions, cached for 60s.
 *
 * Returns 0 when the admin client isn't configured (local dev without
 * Supabase env) — the route handler treats that as "no cap exceeded" so
 * local dev isn't broken by missing env vars.
 */
export async function getDailySpendUsd(): Promise<number> {
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.totalUsd;
  }
  const admin = getSupabaseAdmin();
  if (!admin) {
    return 0;
  }
  const inputPrice = Number(process.env.CHAT_INPUT_PRICE_USD_PER_MILLION_TOKENS);
  const outputPrice = Number(process.env.CHAT_OUTPUT_PRICE_USD_PER_MILLION_TOKENS);
  if (!Number.isFinite(inputPrice) || !Number.isFinite(outputPrice)) {
    console.error('[chat/spendCap] pricing env vars missing or non-numeric — treating spend as 0');
    return 0;
  }
  const { data, error } = await admin
    .schema('chat')
    .from('messages')
    .select('tokens_in,tokens_out')
    .gte('created_at', startOfDayUtcIso())
    .not('tokens_in', 'is', null);
  if (error) {
    console.error('[chat/spendCap] aggregate query failed', error);
    return 0;
  }
  const totalUsd = computeSpendUsd((data ?? []) as TokenPair[], inputPrice, outputPrice);
  cached = { totalUsd, cachedAt: Date.now() };
  return totalUsd;
}

/**
 * Convenience: returns `true` if the current spend is over the env cap.
 * Reads CHAT_DAILY_SPEND_CAP_USD; if missing/invalid, returns `false`
 * (fail-open: don't block users when the cap isn't configured).
 */
export async function isDailySpendOverCap(): Promise<boolean> {
  const cap = Number(process.env.CHAT_DAILY_SPEND_CAP_USD);
  if (!Number.isFinite(cap) || cap <= 0) return false;
  const spend = await getDailySpendUsd();
  return isOverCap(spend, cap);
}
