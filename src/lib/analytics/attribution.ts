/**
 * Per-persona / source attribution (issue #141).
 *
 * Every captured event is tagged with the route-level *surface* it happened on,
 * resolved from the pathname via the surface registry (`resolveSurface`, #125).
 * This is what lets analytics be sliced per persona / source — a $pageview on
 * `/dev` carries `surface: 'dev'`, one on `/blog/foo` carries `surface: 'blog'`,
 * and a default-chrome page carries `surface: 'site'`.
 *
 * The B1 persona shells (#129/#130/#131) consume this attribution; until those
 * land (and the owner provisions the PostHog key), the tagging is inert but
 * fully wired.
 *
 * Pure module — no posthog-js, no DOM — so it is unit-testable in isolation.
 */

import { resolveSurface } from '@/lib/surfaces';
import type { AnalyticsProperties } from './events';

/** Surface value used when no registered surface matches (default site chrome). */
export const DEFAULT_SURFACE = 'site';

/** The attribution properties merged onto every event. */
export interface SurfaceAttribution {
  /** The matched surface value (e.g. 'dev', 'blog', 'projects') or 'site'. */
  surface: string;
  /** The surface kind ('editorial' | 'fullBleed') when matched, else null. */
  surface_kind: string | null;
  /** The pathname the event was attributed to (null when unknown). */
  pathname: string | null;
}

/**
 * Derive attribution properties for a pathname using the surface registry.
 *
 * Falls back to the DEFAULT_SURFACE ('site') for unmatched / missing paths so
 * every event always carries a surface, never undefined.
 */
export function attributionFor(pathname: string | null | undefined): SurfaceAttribution {
  const def = resolveSurface(pathname);
  return {
    surface: def?.surface ?? DEFAULT_SURFACE,
    surface_kind: def?.kind ?? null,
    pathname: pathname ?? null,
  };
}

/**
 * Merge surface attribution onto an event's properties. Caller-supplied
 * properties win over the derived attribution (so an explicit `surface` could
 * override), keeping the helper non-destructive.
 */
export function withAttribution(
  pathname: string | null | undefined,
  properties: AnalyticsProperties = {},
): AnalyticsProperties {
  return { ...attributionFor(pathname), ...properties };
}
