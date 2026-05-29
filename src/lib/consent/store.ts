/**
 * Consent store — pure state-machine + persistence helpers (issue #140).
 *
 * Everything here is pure / side-effect-free except the two localStorage
 * helpers, which take an injectable Storage so they're testable without a DOM.
 * The React layer (ConsentProvider) is a thin wrapper over these functions.
 *
 * State transitions modelled here (covered by store.test.ts):
 *   - default (no decision)        → banner should show, only necessary granted
 *   - acceptAll                    → every category granted, decision recorded
 *   - rejectNonEssential           → only necessary granted, decision recorded
 *   - savePreferences(choices)     → arbitrary per-category grants, recorded
 *   - revoke(category)             → flips a single category off (re-decides)
 *   - grant(category)              → flips a single category on  (re-decides)
 *   - persist round-trip           → write then read yields the same record
 *   - version mismatch / corrupt   → falls back to default (banner re-shows)
 */

import {
  CONSENT_CATEGORIES,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  TOGGLEABLE_CATEGORIES,
  type ConsentCategory,
  type ConsentChoices,
  type ConsentRecord,
  type ToggleableCategory,
} from './types';

/** All-necessary-only baseline: necessary on, every opt-in category off. */
export function defaultChoices(): ConsentChoices {
  const choices = {} as ConsentChoices;
  for (const cat of CONSENT_CATEGORIES) {
    choices[cat.id] = cat.alwaysOn; // only `necessary` is alwaysOn
  }
  return choices;
}

/** Every category granted (used by "accept all"). */
export function allGrantedChoices(): ConsentChoices {
  const choices = {} as ConsentChoices;
  for (const cat of CONSENT_CATEGORIES) {
    choices[cat.id] = true;
  }
  return choices;
}

/** The pristine record: no decision made yet, only necessary granted. */
export function defaultRecord(): ConsentRecord {
  return {
    version: CONSENT_VERSION,
    decidedAt: null,
    choices: defaultChoices(),
  };
}

/**
 * Normalise an arbitrary (possibly partial / untrusted) choices object into a
 * complete, valid ConsentChoices. Necessary is forced on; unknown keys dropped;
 * missing toggleable keys default to off.
 */
export function normalizeChoices(input: Partial<Record<ConsentCategory, boolean>> = {}): ConsentChoices {
  const choices = {} as ConsentChoices;
  for (const cat of CONSENT_CATEGORIES) {
    if (cat.alwaysOn) {
      choices[cat.id] = true;
    } else {
      choices[cat.id] = input[cat.id] === true;
    }
  }
  return choices;
}

/** Has the user made an explicit decision yet? Drives whether the banner shows. */
export function hasDecided(record: ConsentRecord | null | undefined): boolean {
  return Boolean(record && record.decidedAt);
}

/** Is a given category currently consented? Necessary is always true. */
export function isGranted(record: ConsentRecord, category: ConsentCategory): boolean {
  if (category === 'necessary') return true;
  return record.choices[category] === true;
}

function now(timestamp?: string): string {
  return timestamp ?? new Date().toISOString();
}

// --- Transitions: each returns a NEW record (immutable) ---------------------

/** Accept every category. */
export function acceptAll(timestamp?: string): ConsentRecord {
  return { version: CONSENT_VERSION, decidedAt: now(timestamp), choices: allGrantedChoices() };
}

/** Reject everything non-essential (necessary stays on). */
export function rejectNonEssential(timestamp?: string): ConsentRecord {
  return { version: CONSENT_VERSION, decidedAt: now(timestamp), choices: defaultChoices() };
}

/** Save an explicit per-category selection from the preference center. */
export function savePreferences(
  selection: Partial<Record<ToggleableCategory, boolean>>,
  timestamp?: string,
): ConsentRecord {
  return {
    version: CONSENT_VERSION,
    decidedAt: now(timestamp),
    choices: normalizeChoices(selection),
  };
}

/** Flip a single toggleable category on or off, recording a fresh decision. */
export function setCategory(
  record: ConsentRecord,
  category: ToggleableCategory,
  granted: boolean,
  timestamp?: string,
): ConsentRecord {
  return {
    version: CONSENT_VERSION,
    decidedAt: now(timestamp),
    choices: { ...record.choices, [category]: granted, necessary: true },
  };
}

/** Convenience: revoke (turn off) a single category. */
export function revoke(record: ConsentRecord, category: ToggleableCategory, timestamp?: string): ConsentRecord {
  return setCategory(record, category, false, timestamp);
}

/** Convenience: grant (turn on) a single category. */
export function grant(record: ConsentRecord, category: ToggleableCategory, timestamp?: string): ConsentRecord {
  return setCategory(record, category, true, timestamp);
}

// --- Persistence (injectable Storage so it's testable) ----------------------

/**
 * Resolve the browser's localStorage when available, else null (SSR / private
 * mode). Callers degrade gracefully when this is null.
 */
function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Read & validate the persisted record. Returns the default record (no
 * decision) when storage is empty, unreadable, corrupt, or a stale version.
 */
export function readConsent(storage: Storage | null = browserStorage()): ConsentRecord {
  if (!storage) return defaultRecord();
  let raw: string | null;
  try {
    raw = storage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return defaultRecord();
  }
  if (!raw) return defaultRecord();

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    // Stale schema → treat as undecided so the banner re-prompts.
    if (parsed.version !== CONSENT_VERSION) return defaultRecord();
    return {
      version: CONSENT_VERSION,
      decidedAt: typeof parsed.decidedAt === 'string' ? parsed.decidedAt : null,
      choices: normalizeChoices(parsed.choices ?? {}),
    };
  } catch {
    return defaultRecord();
  }
}

/** Persist a record. No-ops (returns false) when storage is unavailable. */
export function writeConsent(record: ConsentRecord, storage: Storage | null = browserStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

/** Clear any stored consent (used by tests and a "reset" affordance). */
export function clearConsent(storage: Storage | null = browserStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export { TOGGLEABLE_CATEGORIES };
