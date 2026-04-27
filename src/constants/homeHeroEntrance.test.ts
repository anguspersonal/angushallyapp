import { describe, it, expect } from 'vitest';
import {
  homeHeroIntroCompleteMs,
  homeHeroTimings,
  homeHeroTimingsReduced,
} from '@/constants/homeHeroEntrance';

describe('homeHeroIntroCompleteMs', () => {
  it('matches the longest full-motion segment end + buffer', () => {
    const ends = Object.values(homeHeroTimings).map((s) => (s.delay + s.duration) * 1000);
    const expected = Math.ceil(Math.max(...ends)) + 80;
    expect(homeHeroIntroCompleteMs(false)).toBe(expected);
  });

  it('matches the longest reduced-motion segment end + buffer', () => {
    const ends = Object.values(homeHeroTimingsReduced).map((s) => (s.delay + s.duration) * 1000);
    const expected = Math.ceil(Math.max(...ends)) + 80;
    expect(homeHeroIntroCompleteMs(true)).toBe(expected);
  });

  it('full-motion delay is longer than reduced', () => {
    expect(homeHeroIntroCompleteMs(false)).toBeGreaterThan(homeHeroIntroCompleteMs(true));
  });
});
