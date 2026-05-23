/**
 * Pathname-based visibility matcher for the chat launcher.
 *
 * Precedence (FR-VIS-2):  forceShow > deny > allow > default-deny.
 *
 * Glob syntax (FR-VIS-3):
 *   `*`        — matches a single path segment (no slashes)
 *   `**`       — matches any chars including slashes
 *   `/**` at end of pattern — special case: matches either the prefix
 *                              alone or the prefix followed by any
 *                              sub-path. This is what makes
 *                              `/projects/**` match both `/projects`
 *                              and `/projects/a/b`.
 *
 * Single source of truth for visibility lives in `visibility.config.ts`.
 *
 * See docs/chatbotv1/requirements.md §5.8 and docs/chatbotv1/design.md §7.
 */

export type VisibilityRule = {
  allow: readonly string[];
  deny: readonly string[];
  forceShow: readonly string[];
};

export function isChatVisible(pathname: string, rules: VisibilityRule): boolean {
  const normalised = normalisePath(pathname);
  if (matchesAny(normalised, rules.forceShow)) return true;
  if (matchesAny(normalised, rules.deny)) return false;
  if (matchesAny(normalised, rules.allow)) return true;
  return false;
}

function normalisePath(pathname: string): string {
  if (!pathname) return '/';
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  // Strip trailing slash except on root, so `/foo/` matches `/foo`.
  if (withSlash.length > 1 && withSlash.endsWith('/')) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
}

function matchesAny(pathname: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => matches(pathname, pattern));
}

function matches(pathname: string, pattern: string): boolean {
  return globToRegExp(pattern).test(pathname);
}

function globToRegExp(pattern: string): RegExp {
  const TRAIL_SS = ' TS ';
  const DOUBLE_STAR = ' DS ';
  const SINGLE_STAR = ' SS ';
  // Order matters: trailing /** first (consumes both the slash and the **),
  // then any remaining ** in the middle, then single *.
  const replaced = pattern
    .replace(/\/\*\*$/g, TRAIL_SS)
    .replace(/\*\*/g, DOUBLE_STAR)
    .replace(/\*/g, SINGLE_STAR);
  const escaped = replaced.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const expanded = escaped
    .replace(new RegExp(TRAIL_SS, 'g'), '(?:/.*)?')
    .replace(new RegExp(DOUBLE_STAR, 'g'), '.*')
    .replace(new RegExp(SINGLE_STAR, 'g'), '[^/]*');
  return new RegExp(`^${expanded}$`);
}
