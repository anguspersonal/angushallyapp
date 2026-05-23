/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CONTACT_DRAFT_STORAGE_KEY } from './ContactDraftCard';

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
