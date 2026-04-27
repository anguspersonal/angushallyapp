import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractMeta,
  fetchOpenGraph,
  resolveOgImageUrl,
} from '@/lib/og-fetch';

describe('extractMeta', () => {
  it('reads og:title when property precedes content', () => {
    const html =
      '<html><head><meta property="og:title" content="Hello &amp; world" /></head></html>';
    expect(extractMeta(html, 'og:title')).toBe('Hello & world');
  });

  it('reads og:title when content precedes property', () => {
    const html =
      '<meta content="Second order" property="og:title" />';
    expect(extractMeta(html, 'og:title')).toBe('Second order');
  });

  it('reads og:description', () => {
    const html =
      '<meta property="og:description" content="A short blurb." />';
    expect(extractMeta(html, 'og:description')).toBe('A short blurb.');
  });

  it('reads og:image', () => {
    const html =
      '<meta property="og:image" content="https://cdn.example.com/og.png" />';
    expect(extractMeta(html, 'og:image')).toBe('https://cdn.example.com/og.png');
  });

  it('reads name=description', () => {
    const html =
      '<meta name="description" content="Plain meta description." />';
    expect(extractMeta(html, 'description')).toBe('Plain meta description.');
  });

  it('reads title tag', () => {
    const html = '<html><head><title>Page &lt;title&gt;</title></head></html>';
    expect(extractMeta(html, 'title')).toBe('Page <title>');
  });

  it('returns null when tag is missing', () => {
    expect(extractMeta('<html></html>', 'og:title')).toBeNull();
  });
});

describe('resolveOgImageUrl', () => {
  it('resolves relative paths against the page URL', () => {
    expect(resolveOgImageUrl('/assets/og.png', 'https://heylina.ai/')).toBe(
      'https://heylina.ai/assets/og.png',
    );
  });

  it('keeps absolute https URLs', () => {
    expect(
      resolveOgImageUrl('https://cdn.heylina.ai/og.jpg', 'https://heylina.ai/'),
    ).toBe('https://cdn.heylina.ai/og.jpg');
  });

  it('returns null for non-http(s) schemes', () => {
    expect(resolveOgImageUrl('data:image/png;base64,xx', 'https://heylina.ai/')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(resolveOgImageUrl(null, 'https://heylina.ai/')).toBeNull();
    expect(resolveOgImageUrl('   ', 'https://heylina.ai/')).toBeNull();
  });
});

describe('fetchOpenGraph', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed data on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        `<!doctype html><meta property="og:title" content="HeyLina" />
         <meta property="og:description" content="From OG." />
         <meta property="og:image" content="/og-relative.png" />`,
    });

    const result = await fetchOpenGraph('https://heylina.ai/');
    expect(result).toEqual({
      title: 'HeyLina',
      description: 'From OG.',
      image: 'https://heylina.ai/og-relative.png',
    });
    expect(globalThis.fetch).toHaveBeenCalledWith('https://heylina.ai/', {
      next: { revalidate: 86400 },
    });
  });

  it('returns null when response is not ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => '',
    });
    expect(await fetchOpenGraph('https://example.com/')).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network down'));
    expect(await fetchOpenGraph('https://example.com/')).toBeNull();
  });

  it('returns null when html has no OG tags', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '<html><head></head><body>hi</body></html>',
    });
    const result = await fetchOpenGraph('https://example.com/');
    expect(result).toEqual({
      title: null,
      description: null,
      image: null,
    });
  });
});
