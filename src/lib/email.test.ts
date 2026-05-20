import { describe, it, expect } from 'vitest';
import { escapeHtml } from './email';

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml('<a href="x">&"\'</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&amp;&quot;&#39;&lt;/a&gt;',
    );
  });

  it('escapes ampersands first so existing entities are not double-decoded on render', () => {
    // & must be escaped before <,>,etc — otherwise &lt; would become &amp;lt; if & was last.
    expect(escapeHtml('Tom & Jerry <3')).toBe('Tom &amp; Jerry &lt;3');
  });

  it('passes through plain text untouched', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });

  it('handles the empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('defends against a script-tag injection attempt', () => {
    const malicious = '<script>alert("xss")</script>';
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain('<script');
    expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });
});
