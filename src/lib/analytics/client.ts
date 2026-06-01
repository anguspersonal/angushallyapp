/**
 * Analytics client — the single wrapper around posthog-js (issue #141).
 *
 * Hard invariants enforced here (the guardrails for the whole feature):
 *
 *   1. NO init / capture without a KEY.    → keyless = clean no-op, ships today.
 *   2. NO init / capture without CONSENT.   → consent is the caller's gate;
 *      this module only ever runs init/capture when explicitly told to, and the
 *      AnalyticsProvider only tells it to once the D0 analytics gate is open.
 *   3. Revoking consent STOPS capture.       → shutdownAnalytics() resets and
 *      drops the instance so nothing further is sent.
 *
 * posthog-js is imported *dynamically* so it is only pulled into the bundle /
 * evaluated when analytics actually initialises (i.e. key present AND consent
 * granted). Importing this module is free until then.
 *
 * The capture helper is typed against the event catalogue (events.ts) and tags
 * every event with surface attribution (attribution.ts).
 */

import type { PostHog } from 'posthog-js';
import { readAnalyticsConfig } from './config';
import { withAttribution } from './attribution';
import type {
  AnalyticsEventName,
  AnalyticsEventProperties,
  AnalyticsProperties,
} from './events';

/** Live PostHog instance, or null when not initialised (keyless / no consent). */
let instance: PostHog | null = null;
/** Guard against concurrent init() calls racing the dynamic import. */
let initializing = false;

/** Is analytics live right now? */
export function isAnalyticsActive(): boolean {
  return instance !== null;
}

/** Current instance (null unless initialised). Exposed for advanced callers/tests. */
export function getAnalyticsInstance(): PostHog | null {
  return instance;
}

/**
 * Initialise PostHog — ONLY call this once consent is granted.
 *
 * No-ops (and stays uninitialised) when:
 *   - no key is configured (keyless deployment), or
 *   - running on the server (no window), or
 *   - already initialised / mid-initialisation.
 *
 * Returns the instance when active, else null.
 */
export async function initAnalytics(
  env: Record<string, string | undefined> = process.env,
): Promise<PostHog | null> {
  if (typeof window === 'undefined') return null; // never init server-side
  if (instance || initializing) return instance;

  const { key, host } = readAnalyticsConfig(env);
  if (!key) return null; // GUARDRAIL: no key → no init, clean no-op.

  initializing = true;
  try {
    const { default: posthog } = await import('posthog-js');
    posthog.init(key, {
      api_host: host,
      // We initialise only after explicit consent, so opt-in is already implied;
      // disable persistence-based autocapture surprises and keep it lean.
      capture_pageview: false, // we drive pageviews manually on route change
      capture_pageleave: true,
      autocapture: false,
      persistence: 'localStorage+cookie',
    });
    instance = posthog;
    return instance;
  } finally {
    initializing = false;
  }
}

/**
 * Tear analytics down — call this when analytics consent is revoked.
 *
 * Resets the PostHog instance (clears identity/persistence) and drops our
 * reference so no further capture is possible until re-initialised. Safe to
 * call when nothing is initialised.
 */
export function shutdownAnalytics(): void {
  if (!instance) return;
  try {
    // reset() clears stored identity; capturing stops because we null the ref.
    instance.reset?.(true);
  } catch {
    // best-effort teardown
  }
  instance = null;
}

/**
 * Capture a typed event with surface attribution.
 *
 * No-ops when analytics is not active (no key and/or no consent) — so call
 * sites never need to guard. `pathname` drives the surface attribution; pass
 * the current route's pathname (e.g. from usePathname()).
 */
export function captureEvent<E extends AnalyticsEventName>(
  event: E,
  properties: AnalyticsEventProperties<E> = {} as AnalyticsEventProperties<E>,
  pathname?: string | null,
): void {
  if (!instance) return; // GUARDRAIL: no init (no key / no consent) → no capture.
  const props = withAttribution(pathname, properties as AnalyticsProperties);
  instance.capture(event, props);
}

/**
 * Capture an App Router pageview for the given pathname, tagged with surface
 * attribution. Thin wrapper over captureEvent for the reserved `$pageview`.
 */
export function capturePageview(pathname: string | null | undefined): void {
  if (!instance) return;
  const url =
    typeof window !== 'undefined' ? window.location.href : (pathname ?? undefined);
  captureEvent('$pageview', { $current_url: url, pathname: pathname ?? undefined }, pathname);
}

/** Test-only: reset module state between tests. */
export function __resetAnalyticsForTests(): void {
  instance = null;
  initializing = false;
}
