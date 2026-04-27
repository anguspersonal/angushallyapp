/**
 * Build-time / server-side Open Graph metadata fetch for external pages.
 * Uses regex extraction only; no runtime scraping from the client bundle.
 */

export type OpenGraphData = {
  title: string | null;
  description: string | null;
  /** Absolute http(s) URL, or null if missing / invalid / non-http(s) */
  image: string | null;
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeBasicEntities(raw: string): string {
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n: string) => {
      const code = Number.parseInt(n, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .trim();
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '').trim();
}

/**
 * Extract a single meta or document title value from raw HTML.
 * Supports `property="og:*"`, `name="description"`, and `<title>`.
 */
export function extractMeta(html: string, key: string): string | null {
  if (key === 'title') {
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!m?.[1]) return null;
    return decodeBasicEntities(stripTags(m[1])) || null;
  }

  if (key.startsWith('og:')) {
    const escaped = escapeRegExp(key);
    const patterns = [
      new RegExp(
        `<meta[^>]+property=["']${escaped}["'][^>]*content=["']([^"']*)["']`,
        'i',
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']*)["'][^>]*property=["']${escaped}["']`,
        'i',
      ),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) {
        const v = decodeBasicEntities(m[1]);
        return v || null;
      }
    }
    return null;
  }

  if (key === 'description') {
    const escaped = escapeRegExp(key);
    const patterns = [
      new RegExp(
        `<meta[^>]+name=["']${escaped}["'][^>]*content=["']([^"']*)["']`,
        'i',
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']*)["'][^>]*name=["']${escaped}["']`,
        'i',
      ),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) {
        const v = decodeBasicEntities(m[1]);
        return v || null;
      }
    }
    return null;
  }

  return null;
}

export function resolveOgImageUrl(
  image: string | null | undefined,
  sourceUrl: string,
): string | null {
  if (!image?.trim()) return null;
  const trimmed = image.trim();
  try {
    const resolved = new URL(trimmed, sourceUrl).href;
    const u = new URL(resolved);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return resolved;
  } catch {
    return null;
  }
}

export async function fetchOpenGraph(url: string): Promise<OpenGraphData | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const html = await res.text();
    const title = extractMeta(html, 'og:title') ?? extractMeta(html, 'title');
    const description =
      extractMeta(html, 'og:description') ?? extractMeta(html, 'description');
    const imageRaw = extractMeta(html, 'og:image');
    const image = resolveOgImageUrl(imageRaw, url);
    return { title, description, image };
  } catch {
    return null;
  }
}
