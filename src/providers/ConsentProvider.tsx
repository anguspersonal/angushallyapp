'use client';

/**
 * ConsentProvider — runtime layer over the pure consent store (issue #140).
 *
 * Holds the live ConsentRecord, persists every change to localStorage, and
 * exposes the consent state + transition actions to the tree. The banner reads
 * `shouldShowBanner`; the preference center reads/writes `choices`; gated code
 * reads consent via `useConsentGate` (a thin selector over this context).
 *
 * SSR-safe: the initial server render assumes the *default* record (no
 * decision, only necessary granted) so the markup is deterministic; once
 * mounted on the client we hydrate from localStorage. This means non-essential
 * scripts are NEVER loaded during SSR or before hydration — gating fails
 * closed.
 */

import * as React from 'react';
import {
  acceptAll as acceptAllT,
  defaultRecord,
  isGranted,
  readConsent,
  rejectNonEssential as rejectNonEssentialT,
  savePreferences as savePreferencesT,
  setCategory as setCategoryT,
  writeConsent,
} from '@/lib/consent/store';
import type {
  ConsentCategory,
  ConsentChoices,
  ConsentRecord,
  ToggleableCategory,
} from '@/lib/consent/types';

export interface ConsentContextValue {
  /** The live record. */
  record: ConsentRecord;
  /** Convenience accessor for per-category grants. */
  choices: ConsentChoices;
  /** True once the client has hydrated stored consent (false during SSR). */
  hydrated: boolean;
  /** True when the user has not yet made an explicit decision. */
  needsDecision: boolean;
  /** Whether the banner should be visible (needs decision AND hydrated). */
  shouldShowBanner: boolean;
  /** Whether the preference center modal is open. */
  isPreferenceCenterOpen: boolean;

  /** Is a category currently consented? Necessary is always true. */
  isCategoryGranted: (category: ConsentCategory) => boolean;

  /** Transition actions (each persists). */
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (selection: Partial<Record<ToggleableCategory, boolean>>) => void;
  setCategory: (category: ToggleableCategory, granted: boolean) => void;

  /** Open / close the preference center (re-openable from footer / privacy). */
  openPreferenceCenter: () => void;
  closePreferenceCenter: () => void;
}

const ConsentContext = React.createContext<ConsentContextValue | null>(null);

export interface ConsentProviderProps {
  children: React.ReactNode;
  /**
   * Seed record for tests / Storybook. When provided, hydration is skipped and
   * this record is used directly (treated as already hydrated).
   */
  initialRecord?: ConsentRecord;
}

export function ConsentProvider({ children, initialRecord }: ConsentProviderProps) {
  const [record, setRecord] = React.useState<ConsentRecord>(initialRecord ?? defaultRecord());
  const [hydrated, setHydrated] = React.useState<boolean>(Boolean(initialRecord));
  const [isPreferenceCenterOpen, setPreferenceCenterOpen] = React.useState(false);

  // Hydrate from localStorage on the client. Runs once; skipped when a seed
  // record was supplied (tests).
  React.useEffect(() => {
    if (initialRecord) return;
    setRecord(readConsent());
    setHydrated(true);
  }, [initialRecord]);

  // Persist the record whenever it changes (after hydration so we never clobber
  // stored consent with the SSR default before reading it).
  const commit = React.useCallback((next: ConsentRecord) => {
    setRecord(next);
    writeConsent(next);
  }, []);

  const acceptAll = React.useCallback(() => {
    commit(acceptAllT());
    setPreferenceCenterOpen(false);
  }, [commit]);

  const rejectNonEssential = React.useCallback(() => {
    commit(rejectNonEssentialT());
    setPreferenceCenterOpen(false);
  }, [commit]);

  const savePreferences = React.useCallback(
    (selection: Partial<Record<ToggleableCategory, boolean>>) => {
      commit(savePreferencesT(selection));
      setPreferenceCenterOpen(false);
    },
    [commit],
  );

  const setCategory = React.useCallback(
    (category: ToggleableCategory, granted: boolean) => {
      setRecord((prev) => {
        const next = setCategoryT(prev, category, granted);
        writeConsent(next);
        return next;
      });
    },
    [],
  );

  const isCategoryGranted = React.useCallback(
    (category: ConsentCategory) => isGranted(record, category),
    [record],
  );

  const openPreferenceCenter = React.useCallback(() => setPreferenceCenterOpen(true), []);
  const closePreferenceCenter = React.useCallback(() => setPreferenceCenterOpen(false), []);

  const needsDecision = !record.decidedAt;

  const value = React.useMemo<ConsentContextValue>(
    () => ({
      record,
      choices: record.choices,
      hydrated,
      needsDecision,
      // Only show the banner once hydrated so we don't flash it on every
      // server render for users who already decided.
      shouldShowBanner: hydrated && needsDecision,
      isPreferenceCenterOpen,
      isCategoryGranted,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      setCategory,
      openPreferenceCenter,
      closePreferenceCenter,
    }),
    [
      record,
      hydrated,
      needsDecision,
      isPreferenceCenterOpen,
      isCategoryGranted,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      setCategory,
      openPreferenceCenter,
      closePreferenceCenter,
    ],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

/**
 * Access the consent context. Returns null when no provider is mounted so
 * consumers (and the gate) can fail safe rather than throw.
 */
export function useConsentContext(): ConsentContextValue | null {
  return React.useContext(ConsentContext);
}
