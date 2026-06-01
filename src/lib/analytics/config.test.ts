import { describe, it, expect } from 'vitest';
import {
  DEFAULT_POSTHOG_HOST,
  readAnalyticsConfig,
  isAnalyticsConfigured,
} from './config';

/**
 * Config reader (issue #141). The KEY is the load-bearing toggle: absent key
 * ⇒ analytics is a no-op. These tests pin that contract using an injected env
 * bag so they don't depend on the real process.env.
 */
describe('readAnalyticsConfig', () => {
  it('returns a null key when NEXT_PUBLIC_POSTHOG_KEY is absent', () => {
    expect(readAnalyticsConfig({}).key).toBeNull();
  });

  it('treats an empty / whitespace-only key as absent', () => {
    expect(readAnalyticsConfig({ NEXT_PUBLIC_POSTHOG_KEY: '' }).key).toBeNull();
    expect(readAnalyticsConfig({ NEXT_PUBLIC_POSTHOG_KEY: '   ' }).key).toBeNull();
  });

  it('reads and trims the key when present', () => {
    expect(readAnalyticsConfig({ NEXT_PUBLIC_POSTHOG_KEY: '  phc_abc  ' }).key).toBe('phc_abc');
  });

  it('defaults the host when not provided', () => {
    expect(readAnalyticsConfig({ NEXT_PUBLIC_POSTHOG_KEY: 'phc_abc' }).host).toBe(
      DEFAULT_POSTHOG_HOST,
    );
  });

  it('reads a custom host when provided', () => {
    const cfg = readAnalyticsConfig({
      NEXT_PUBLIC_POSTHOG_KEY: 'phc_abc',
      NEXT_PUBLIC_POSTHOG_HOST: 'https://us.i.posthog.com',
    });
    expect(cfg.host).toBe('https://us.i.posthog.com');
  });
});

describe('isAnalyticsConfigured', () => {
  it('is false without a key (keyless deployment → no-op)', () => {
    expect(isAnalyticsConfigured({})).toBe(false);
  });

  it('is true once a key is set', () => {
    expect(isAnalyticsConfigured({ NEXT_PUBLIC_POSTHOG_KEY: 'phc_abc' })).toBe(true);
  });
});
