import * as React from 'react';

/**
 * Minimal, safe markdown renderer for assistant chat messages.
 *
 * Scope (FR-UI-9):  links, bold, unordered lists. Paragraph breaks on blank lines.
 *
 * Why a hand-rolled renderer instead of `react-markdown`:
 *   - Zero added dependency (TC-5).
 *   - Sanitiser is opaque and built-in: every output is a React text/element
 *     node — `dangerouslySetInnerHTML` is never used, so HTML in the source
 *     string is rendered as literal text. No `<script>` / iframe / SVG vector.
 *   - URL safety enforced at parse time: only `http(s)://`, protocol-relative
 *     `//`, and same-origin paths (`/foo`) are linked. Anything else is
 *     rendered as plain text. Closes FR-SAFE-7.
 *
 * Anything outside the supported subset (headings, tables, code fences,
 * images, autolinks…) is left as plain text — better than a half-broken
 * render with surprise behaviour.
 */

const LINK_RE = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;
const BOLD_RE = /\*\*([^*\n][^*]*?)\*\*/g;
const LIST_LINE_RE = /^\s*[-*]\s+(.+)$/;

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Render markdown source as React nodes. The return value is always
 * defined and never null — empty strings render to `null`.
 */
export function renderMarkdown(source: string): React.ReactNode {
  if (!source) return null;

  const paragraphs = source.split(/\n{2,}/);
  return paragraphs.map((paragraph, idx) => renderBlock(paragraph, idx));
}

function renderBlock(block: string, key: number): React.ReactNode {
  const trimmed = block.trim();
  if (!trimmed) return null;

  // List block: every non-empty line starts with `- ` or `* `.
  const lines = trimmed.split('\n');
  const isList = lines.every((line) => LIST_LINE_RE.test(line));
  if (isList) {
    return (
      <ul key={key}>
        {lines.map((line, i) => {
          const match = line.match(LIST_LINE_RE);
          return <li key={i}>{renderInline(match ? match[1] : line)}</li>;
        })}
      </ul>
    );
  }

  // Default: paragraph. Newlines inside a paragraph become <br/>.
  return (
    <p key={key}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {renderInline(line)}
        </React.Fragment>
      ))}
    </p>
  );
}

/**
 * Inline parsing. Order: links → bold → text.
 *
 * Each pass scans the input, emits text/element segments, and the next
 * pass runs on the text segments only. This keeps the parser O(n) per
 * pass and avoids quadratic backtracking.
 */
function renderInline(text: string): React.ReactNode[] {
  const afterLinks = tokeniseLinks(text);
  return afterLinks.flatMap((token, i) => {
    if (typeof token !== 'string') return [React.cloneElement(token, { key: `l-${i}` })];
    return tokeniseBold(token).map((boldToken, j) => {
      if (typeof boldToken !== 'string') {
        return React.cloneElement(boldToken, { key: `l-${i}-b-${j}` });
      }
      return <React.Fragment key={`l-${i}-b-${j}-t`}>{boldToken}</React.Fragment>;
    });
  });
}

type Token = string | React.ReactElement;

function tokeniseLinks(input: string): Token[] {
  const out: Token[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(LINK_RE.source, 'g');
  while ((m = re.exec(input)) !== null) {
    if (m.index > lastIndex) out.push(input.slice(lastIndex, m.index));
    const [, text, url] = m;
    if (isSafeUrl(url)) {
      const isExternal = /^(https?:)?\/\//i.test(url);
      out.push(
        <a
          href={url}
          {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {text}
        </a>,
      );
    } else {
      // Unsafe URL — render the source text verbatim so the user sees it,
      // and so the bot's intent isn't silently lost.
      out.push(`[${text}](${url})`);
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < input.length) out.push(input.slice(lastIndex));
  return out;
}

function tokeniseBold(input: string): Token[] {
  const out: Token[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(BOLD_RE.source, 'g');
  while ((m = re.exec(input)) !== null) {
    if (m.index > lastIndex) out.push(input.slice(lastIndex, m.index));
    out.push(<strong>{m[1]}</strong>);
    lastIndex = re.lastIndex;
  }
  if (lastIndex < input.length) out.push(input.slice(lastIndex));
  return out;
}

/**
 * Treat `http(s)://…`, protocol-relative `//…`, and same-origin paths
 * (`/foo`, `./foo`, `#anchor`) as safe. Everything else — including
 * `javascript:`, `data:`, `vbscript:`, `file:` — is unsafe.
 */
function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('#')) {
    return true;
  }
  if (trimmed.startsWith('//')) return true;
  try {
    const parsed = new URL(trimmed);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}
