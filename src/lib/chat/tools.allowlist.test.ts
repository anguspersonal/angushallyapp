import { describe, expect, it } from 'vitest';
import { ROUTE_ALLOWLIST } from './tools.allowlist.generated';
import { VISIBILITY } from './visibility.config';
import { isChatVisible } from './visibility';

/**
 * Property 4 (docs/chatbotv1/tasks.md §4.2): the route allowlist (what the
 * `navigate` tool can propose) is **disjoint from the deny list** (where
 * the chat is hidden in the first place). Violating this would let the
 * model offer to navigate to a page where the bot then disappears — a
 * surprising UX, and a likely safety regression too.
 *
 * Validates: FR-AGENT-2, FR-VIS-4.
 */
describe('ROUTE_ALLOWLIST', () => {
  it('contains at least the homepage', () => {
    expect(ROUTE_ALLOWLIST).toContain('/');
  });

  it('every entry is a string starting with a forward slash', () => {
    for (const route of ROUTE_ALLOWLIST) {
      expect(typeof route).toBe('string');
      expect(route.startsWith('/')).toBe(true);
    }
  });

  it('contains no duplicates', () => {
    expect(new Set(ROUTE_ALLOWLIST).size).toBe(ROUTE_ALLOWLIST.length);
  });

  it('is disjoint from the visibility deny list', () => {
    // For every allowlisted route, the visibility matcher must return true
    // (i.e. the chat is visible there) — otherwise the bot could navigate
    // the user to a page where the chat then vanishes.
    for (const route of ROUTE_ALLOWLIST) {
      expect(isChatVisible(route, VISIBILITY)).toBe(true);
    }
  });

  it('does not contain /login or any /auth/** path', () => {
    // Explicit sentinel — the v1 deny list deliberately covers these.
    expect(ROUTE_ALLOWLIST).not.toContain('/login');
    for (const route of ROUTE_ALLOWLIST) {
      expect(route.startsWith('/auth/')).toBe(false);
    }
  });
});
