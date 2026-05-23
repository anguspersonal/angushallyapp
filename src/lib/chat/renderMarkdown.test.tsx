/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { renderMarkdown } from './renderMarkdown';

function html(source: string): string {
  const { container } = render(<>{renderMarkdown(source)}</>);
  return container.innerHTML;
}

describe('renderMarkdown', () => {
  describe('plain text', () => {
    it('returns null for empty input', () => {
      expect(renderMarkdown('')).toBeNull();
    });

    it('wraps a single line in a paragraph', () => {
      expect(html('hello world')).toBe('<p>hello world</p>');
    });

    it('treats two newlines as a paragraph break', () => {
      expect(html('first\n\nsecond')).toBe('<p>first</p><p>second</p>');
    });

    it('treats a single newline as a line break inside the paragraph', () => {
      expect(html('one\ntwo')).toBe('<p>one<br>two</p>');
    });
  });

  describe('bold', () => {
    it('renders **bold** as <strong>', () => {
      expect(html('a **bold** thing')).toBe('<p>a <strong>bold</strong> thing</p>');
    });

    it('handles multiple bold spans in one line', () => {
      expect(html('**a** then **b**')).toBe('<p><strong>a</strong> then <strong>b</strong></p>');
    });

    it('does not match across newlines', () => {
      expect(html('**a\nb**')).toBe('<p>**a<br>b**</p>');
    });
  });

  describe('links', () => {
    it('renders an internal link', () => {
      expect(html('see [habit](/projects/habit)')).toBe(
        '<p>see <a href="/projects/habit">habit</a></p>',
      );
    });

    it('opens external links in a new tab with rel=noopener', () => {
      expect(html('[Anthropic](https://anthropic.com)')).toBe(
        '<p><a href="https://anthropic.com" target="_blank" rel="noopener noreferrer">Anthropic</a></p>',
      );
    });

    it('accepts protocol-relative URLs as external', () => {
      expect(html('[cdn](//cdn.example.com/x.png)')).toBe(
        '<p><a href="//cdn.example.com/x.png" target="_blank" rel="noopener noreferrer">cdn</a></p>',
      );
    });

    it('accepts anchors and ./paths', () => {
      expect(html('[top](#top)')).toContain('<a href="#top">top</a>');
      expect(html('[here](./near)')).toContain('<a href="./near">here</a>');
    });

    it('renders the literal markdown when the URL is unsafe', () => {
      // javascript:, data:, vbscript:, file: must NOT become <a>
      expect(html('[click](javascript:alert(1))')).toBe('<p>[click](javascript:alert(1))</p>');
      expect(html('[pic](data:text/html,<script>1</script>)')).toContain(
        '[pic](data:text/html,&lt;script&gt;1&lt;/script&gt;)',
      );
      expect(html('[x](vbscript:msgbox(1))')).toBe('<p>[x](vbscript:msgbox(1))</p>');
    });
  });

  describe('lists', () => {
    it('renders a single unordered list', () => {
      expect(html('- one\n- two\n- three')).toBe('<ul><li>one</li><li>two</li><li>three</li></ul>');
    });

    it('supports * as a list marker', () => {
      expect(html('* a\n* b')).toBe('<ul><li>a</li><li>b</li></ul>');
    });

    it('parses bold and links inside list items', () => {
      expect(html('- see [habit](/projects/habit)\n- and **bold**')).toBe(
        '<ul><li>see <a href="/projects/habit">habit</a></li><li>and <strong>bold</strong></li></ul>',
      );
    });
  });

  describe('XSS / sanitisation', () => {
    it('renders raw HTML as literal text, never as elements', () => {
      const out = html('<script>alert(1)</script>');
      expect(out).not.toContain('<script>');
      expect(out).toContain('&lt;script&gt;');
    });

    it('does not allow attribute injection inside link text', () => {
      const out = html('[<img src=x onerror=alert(1)>](https://x.com)');
      // The link text is rendered as literal characters by React; no <img> element.
      expect(out).not.toMatch(/<img/i);
    });

    it('does not allow a javascript: protocol via mixed case', () => {
      expect(html('[x](JavaScript:alert(1))')).toContain('[x](JavaScript:alert(1))');
      expect(html('[x](  javascript:alert(1)  )')).toContain('[x](');
    });
  });
});
