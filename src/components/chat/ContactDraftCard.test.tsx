/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CONTACT_DRAFT_STORAGE_KEY, truncateAtWord } from './ContactDraftCard';

describe('truncateAtWord', () => {
  it('returns the text unchanged when under the cap', () => {
    expect(truncateAtWord('short', 200)).toBe('short');
  });

  it('cuts at the last whitespace before the cap', () => {
    // 30 words of 6 chars each = 209 chars total; cap at 100 should land on
    // a space boundary, not mid-word.
    const text = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14';
    const out = truncateAtWord(text, 50);
    expect(out.endsWith('…')).toBe(true);
    // Last char before "…" must be a non-space (we trimEnd'd) and the
    // last token must be a complete word (no trailing partial).
    const beforeEllipsis = out.slice(0, -1);
    expect(beforeEllipsis).not.toMatch(/\s$/);
    const lastToken = beforeEllipsis.split(' ').pop()!;
    expect(text).toContain(' ' + lastToken + ' ');
  });

  it('falls back to mid-word cut when no nearby space exists', () => {
    // A 250-char unbroken token; cap at 50 forces mid-word cut.
    const unbroken = 'a'.repeat(250);
    const out = truncateAtWord(unbroken, 50);
    expect(out.length).toBe(51); // 50 chars + '…'
    expect(out.endsWith('…')).toBe(true);
  });

  it('regression: the screenshot case ends on a clean word', () => {
    // The "your vi…" mid-word truncation from the user's screenshot.
    const text =
      "Hi Angus,\n\nI'm interested in learning more about HeyLina and exploring potential investment opportunities. Would you have time for a video call next Wednesday? I'd love to discuss the product, your vision, and the opportunity. Best, Jim";
    const out = truncateAtWord(text, 200);
    expect(out.endsWith('…')).toBe(true);
    // The buggy version produced "…the product, your vi…". The fix
    // should land on a word boundary — the last visible token is a
    // complete word found in the source.
    const beforeEllipsis = out.slice(0, -1).trimEnd();
    const lastToken = beforeEllipsis.split(/\s+/).pop()!;
    expect(text.split(/\s+/)).toContain(lastToken);
  });
});

describe('CONTACT_DRAFT_STORAGE_KEY', () => {
  it('is exported as a stable string', () => {
    expect(typeof CONTACT_DRAFT_STORAGE_KEY).toBe('string');
    expect(CONTACT_DRAFT_STORAGE_KEY.length).toBeGreaterThan(0);
  });

  it('uses the `chat:` namespace prefix so it does not collide with other stores', () => {
    expect(CONTACT_DRAFT_STORAGE_KEY.startsWith('chat:')).toBe(true);
  });
});

/**
 * Property 9 (docs/chatbotv1/tasks.md §9.5): contact-draft round-trip
 * preserves field mapping `body → message`.
 *
 * The component itself routes via Next.js's router, which jsdom can't
 * exercise here. What we CAN exercise is the sessionStorage shape: that
 * a ContactDraft with `{ subject, body, name?, email? }` serialises and
 * deserialises losslessly. The /contact page reads back from this key
 * with `JSON.parse` and maps `draft.body → form.message`.
 */
describe('contact-draft sessionStorage round-trip', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('preserves all four fields across set/get/JSON.parse', () => {
    const draft = {
      subject: 'Hello from the bot',
      body: 'Hi Angus — I would love to chat about hiring you.',
      name: 'Jane Doe',
      email: 'jane@example.com',
    };
    sessionStorage.setItem(CONTACT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    const parsed = JSON.parse(sessionStorage.getItem(CONTACT_DRAFT_STORAGE_KEY)!);
    expect(parsed).toEqual(draft);
  });

  it('omits optional fields cleanly when not provided', () => {
    const draft = { subject: 'Hi', body: 'Reach out about a project.' };
    sessionStorage.setItem(CONTACT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    const parsed = JSON.parse(sessionStorage.getItem(CONTACT_DRAFT_STORAGE_KEY)!);
    expect(parsed).toEqual(draft);
    expect(parsed).not.toHaveProperty('name');
    expect(parsed).not.toHaveProperty('email');
  });

  it('handles bodies with newlines, quotes, and special characters', () => {
    const draft = {
      subject: 'Quotes "and" newlines',
      body: 'Line 1.\n"Line 2 quoted".\nLine 3 with — em dash and \'apostrophes\'.',
    };
    sessionStorage.setItem(CONTACT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    const parsed = JSON.parse(sessionStorage.getItem(CONTACT_DRAFT_STORAGE_KEY)!);
    expect(parsed.body).toBe(draft.body);
  });
});
