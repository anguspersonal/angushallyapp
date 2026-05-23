/**
 * In-memory sliding-window rate limiter, keyed by an opaque string (usually
 * `ipHash`). Single-instance scope is fine for v1 — see DQ6 in design §16.
 *
 * Algorithm: per-key array of timestamps; on each `consume()` we drop
 * entries older than the window and append `now`. If the array is at or
 * over `limit`, we reject. O(n) per call where n ≤ limit, which is fine
 * for n=20.
 *
 * Module-level state intentionally: we want one bucket per Node process.
 * Tests can call `__resetForTests()` to reset between cases.
 */

const buckets = new Map<string, number[]>();

export type RateLimitResult = {
  allowed: boolean;
  /** ms until the oldest request in the window expires (0 if allowed). */
  retryAfterMs: number;
};

export type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

/** Default per-IP cap matching FR-RATE-1: 20 requests / 5 minutes. */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  limit: 20,
  windowMs: 5 * 60 * 1000,
};

export function consume(
  key: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT,
  now: number = Date.now(),
): RateLimitResult {
  const window = buckets.get(key) ?? [];
  const cutoff = now - config.windowMs;
  // Drop expired entries in-place.
  let firstFresh = 0;
  while (firstFresh < window.length && window[firstFresh] <= cutoff) {
    firstFresh += 1;
  }
  const fresh = firstFresh === 0 ? window : window.slice(firstFresh);

  if (fresh.length >= config.limit) {
    const oldest = fresh[0];
    return {
      allowed: false,
      retryAfterMs: Math.max(0, oldest + config.windowMs - now),
    };
  }

  fresh.push(now);
  buckets.set(key, fresh);
  return { allowed: true, retryAfterMs: 0 };
}

/** Test-only: nuke all state between test cases. */
export function __resetRateLimiterForTests(): void {
  buckets.clear();
}
