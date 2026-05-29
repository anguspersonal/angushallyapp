/**
 * Analytics config — reads the angushallyapp PostHog key/host from env (issue #141).
 *
 * This is pure (no posthog-js import, no DOM) so it's trivially unit-testable
 * and safe to import on the server. The KEY is the load-bearing toggle: when it
 * is absent the whole analytics layer is a deliberate no-op (see client.ts), so
 * the feature ships keyless today and lights up the instant the owner sets the
 * env var on their own PostHog project — no code change required.
 *
 * IMPORTANT: this is angushallyapp's OWN PostHog project, not the HeyLina one.
 * The owner action (documented in docs/guides/analytics.md) is to create that
 * project and provide NEXT_PUBLIC_POSTHOG_KEY (+ optionally NEXT_PUBLIC_POSTHOG_HOST).
 */

/** Default PostHog ingestion host (EU cloud). Overridable via env. */
export const DEFAULT_POSTHOG_HOST = 'https://eu.i.posthog.com';

export interface AnalyticsConfig {
  /** Project API key. `null` when unset → analytics is a no-op. */
  key: string | null;
  /** Ingestion host. Falls back to DEFAULT_POSTHOG_HOST. */
  host: string;
}

/** Trim + treat empty/whitespace-only env values as absent. */
function clean(value: string | undefined | null): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Resolve the analytics config from a process.env-like bag (injectable for
 * tests). Reads NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST.
 */
export function readAnalyticsConfig(
  env: Record<string, string | undefined> = process.env,
): AnalyticsConfig {
  return {
    key: clean(env.NEXT_PUBLIC_POSTHOG_KEY),
    host: clean(env.NEXT_PUBLIC_POSTHOG_HOST) ?? DEFAULT_POSTHOG_HOST,
  };
}

/**
 * Is analytics configured? False when no key is present, in which case every
 * downstream entry point must no-op rather than touch posthog-js or the network.
 */
export function isAnalyticsConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return readAnalyticsConfig(env).key !== null;
}
