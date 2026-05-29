import { describe, it, expect, beforeEach } from 'vitest';
import {
  acceptAll,
  allGrantedChoices,
  clearConsent,
  defaultChoices,
  defaultRecord,
  grant,
  hasDecided,
  isGranted,
  normalizeChoices,
  readConsent,
  rejectNonEssential,
  revoke,
  savePreferences,
  setCategory,
  writeConsent,
} from './store';
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from './types';

/**
 * Behaviour tests for the pure consent store (issue #140).
 *
 * Covers the acceptance criteria: granular categories, strictly-necessary
 * always-on, state transitions, persistence + revocation. Storage is a simple
 * in-memory fake so nothing touches a real DOM.
 */

/** Minimal in-memory Storage implementation for persistence tests. */
function makeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, v),
  } as Storage;
}

describe('default / baseline state', () => {
  it('default record has no decision and only necessary granted', () => {
    const rec = defaultRecord();
    expect(rec.decidedAt).toBeNull();
    expect(hasDecided(rec)).toBe(false);
    expect(rec.choices.necessary).toBe(true);
    expect(rec.choices.security).toBe(false);
    expect(rec.choices.analytics).toBe(false);
    expect(rec.choices.functional).toBe(false);
  });

  it('defaultChoices grants necessary only', () => {
    expect(defaultChoices()).toEqual({
      necessary: true,
      security: false,
      analytics: false,
      functional: false,
    });
  });

  it('allGrantedChoices grants every category', () => {
    expect(allGrantedChoices()).toEqual({
      necessary: true,
      security: true,
      analytics: true,
      functional: true,
    });
  });

  it('necessary is always granted regardless of stored value', () => {
    const rec = defaultRecord();
    expect(isGranted(rec, 'necessary')).toBe(true);
  });
});

describe('normalizeChoices', () => {
  it('forces necessary on and defaults unknown/missing to off', () => {
    expect(normalizeChoices({})).toEqual({
      necessary: true,
      security: false,
      analytics: false,
      functional: false,
    });
  });

  it('keeps explicitly granted toggleable categories', () => {
    expect(normalizeChoices({ analytics: true })).toEqual({
      necessary: true,
      security: false,
      analytics: true,
      functional: false,
    });
  });

  it('ignores attempts to turn necessary off', () => {
    expect(normalizeChoices({ necessary: false }).necessary).toBe(true);
  });
});

describe('state transitions', () => {
  const T = '2026-05-29T12:00:00.000Z';

  it('acceptAll grants everything and records a decision', () => {
    const rec = acceptAll(T);
    expect(rec.decidedAt).toBe(T);
    expect(hasDecided(rec)).toBe(true);
    expect(rec.choices).toEqual(allGrantedChoices());
  });

  it('rejectNonEssential keeps only necessary and records a decision', () => {
    const rec = rejectNonEssential(T);
    expect(rec.decidedAt).toBe(T);
    expect(rec.choices).toEqual(defaultChoices());
    expect(isGranted(rec, 'analytics')).toBe(false);
  });

  it('savePreferences applies an explicit selection', () => {
    const rec = savePreferences({ analytics: true, functional: false }, T);
    expect(rec.decidedAt).toBe(T);
    expect(isGranted(rec, 'analytics')).toBe(true);
    expect(isGranted(rec, 'functional')).toBe(false);
    expect(isGranted(rec, 'security')).toBe(false);
    expect(isGranted(rec, 'necessary')).toBe(true);
  });

  it('setCategory flips a single category and re-records the decision', () => {
    const base = rejectNonEssential('2020-01-01T00:00:00.000Z');
    const next = setCategory(base, 'analytics', true, T);
    expect(isGranted(next, 'analytics')).toBe(true);
    expect(next.decidedAt).toBe(T);
    // other categories unchanged
    expect(isGranted(next, 'security')).toBe(false);
  });

  it('grant turns a category on, revoke turns it off (revocation)', () => {
    const accepted = acceptAll(T);
    expect(isGranted(accepted, 'analytics')).toBe(true);

    const revoked = revoke(accepted, 'analytics', T);
    expect(isGranted(revoked, 'analytics')).toBe(false);
    // revoking analytics must not disturb other categories
    expect(isGranted(revoked, 'security')).toBe(true);
    expect(isGranted(revoked, 'necessary')).toBe(true);

    const regranted = grant(revoked, 'analytics', T);
    expect(isGranted(regranted, 'analytics')).toBe(true);
  });

  it('transitions are immutable (do not mutate the input record)', () => {
    const base = defaultRecord();
    const snapshot = JSON.stringify(base);
    setCategory(base, 'analytics', true, T);
    expect(JSON.stringify(base)).toBe(snapshot);
  });
});

describe('persistence + revocation round-trip', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = makeStorage();
  });

  it('writeConsent then readConsent yields the same decision', () => {
    const rec = acceptAll('2026-05-29T12:00:00.000Z');
    expect(writeConsent(rec, storage)).toBe(true);

    const read = readConsent(storage);
    expect(read.decidedAt).toBe(rec.decidedAt);
    expect(read.choices).toEqual(rec.choices);
    expect(hasDecided(read)).toBe(true);
  });

  it('a revoked category survives a persistence round-trip', () => {
    const revoked = revoke(acceptAll('2026-05-29T12:00:00.000Z'), 'analytics');
    writeConsent(revoked, storage);
    const read = readConsent(storage);
    expect(isGranted(read, 'analytics')).toBe(false);
    expect(isGranted(read, 'security')).toBe(true);
  });

  it('reading empty storage returns the undecided default', () => {
    const read = readConsent(storage);
    expect(hasDecided(read)).toBe(false);
    expect(read.choices).toEqual(defaultChoices());
  });

  it('reading corrupt JSON falls back to the undecided default', () => {
    storage.setItem(CONSENT_STORAGE_KEY, '{not valid json');
    const read = readConsent(storage);
    expect(hasDecided(read)).toBe(false);
  });

  it('reading a stale version falls back to undecided (banner re-prompts)', () => {
    storage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ version: CONSENT_VERSION + 99, decidedAt: 'x', choices: allGrantedChoices() }),
    );
    const read = readConsent(storage);
    expect(hasDecided(read)).toBe(false);
    expect(read.choices).toEqual(defaultChoices());
  });

  it('clearConsent removes a stored decision', () => {
    writeConsent(acceptAll(), storage);
    clearConsent(storage);
    expect(readConsent(storage).decidedAt).toBeNull();
  });

  it('null storage (SSR / private mode) degrades gracefully', () => {
    expect(writeConsent(acceptAll(), null)).toBe(false);
    expect(readConsent(null).decidedAt).toBeNull();
  });
});
