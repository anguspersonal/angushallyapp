/**
 * Single source of truth for homepage hero entrance timings.
 * Used by HomePageClient (Framer variants) and ClientLayout (header reveal delay).
 */

export const homeHeroEase = [0.22, 1, 0.36, 1] as const;

/** Full-motion hero timings (seconds) */
export const homeHeroTimings = {
  photo: { delay: 0.5, duration: 1.68 },
  headline: { delay: 0.5 + 0.22 * 1.5, duration: 1.23 },
  subtitle: { delay: 0.5 + 0.36 * 1.5, duration: 1.08 },
  actions: { delay: 0.5 + 0.5 * 1.5, duration: 1.02 },
} as const;

/** prefers-reduced-motion hero timings (seconds) */
export const homeHeroTimingsReduced = {
  photo: { delay: 0.5, duration: 0.48 },
  headline: { delay: 0.5 + 0.08 * 1.5, duration: 0.48 },
  subtitle: { delay: 0.5 + 0.18 * 1.5, duration: 0.48 },
  actions: { delay: 0.5 + 0.28 * 1.5, duration: 0.48 },
} as const;

function segmentEndSec(segment: { delay: number; duration: number }): number {
  return segment.delay + segment.duration;
}

/**
 * When the last hero entrance motion finishes (ms), plus a short buffer so the
 * header does not appear mid-blur.
 */
export function homeHeroIntroCompleteMs(reducedMotion: boolean): number {
  const segments = reducedMotion
    ? Object.values(homeHeroTimingsReduced)
    : Object.values(homeHeroTimings);
  const lastEndSec = Math.max(...segments.map(segmentEndSec));
  return Math.ceil(lastEndSec * 1000) + 80;
}
