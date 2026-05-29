'use client';

/**
 * Consent GATE API (issue #140).
 *
 * This is the public interface other code calls to defer loading non-essential
 * cookies / scripts until the matching category is consented. Example:
 *
 *   const analyticsAllowed = useConsentGate('analytics');
 *   useEffect(() => {
 *     if (!analyticsAllowed) return;       // not consented → never loads
 *     loadPostHog();
 *   }, [analyticsAllowed]);
 *
 * Revoking a category flips the returned value to false, so consumers that
 * watch it can tear their script down.
 *
 * Fail-closed semantics: before hydration, or when no ConsentProvider is
 * mounted, every non-necessary category reads as NOT consented. `necessary`
 * always reads as consented. This guarantees non-essential scripts never load
 * during SSR / before a decision.
 */

import * as React from 'react';
import { useConsentContext } from '@/providers/ConsentProvider';
import type { ConsentCategory } from './types';

/**
 * Returns whether the given category is currently consented.
 *
 * `necessary` is always true. Everything else is false until the user has
 * consented to it AND the client has hydrated.
 */
export function useConsentGate(category: ConsentCategory): boolean {
  const ctx = useConsentContext();

  return React.useMemo(() => {
    if (category === 'necessary') return true;
    // No provider, or not hydrated yet → fail closed.
    if (!ctx || !ctx.hydrated) return false;
    return ctx.isCategoryGranted(category);
  }, [ctx, category]);
}

/**
 * Imperative variant returning the live consent context plus a `can(category)`
 * helper, for code that needs more than a single boolean (e.g. to read
 * multiple categories or trigger the preference center).
 *
 * `can` carries the same fail-closed semantics as `useConsentGate`.
 */
export function useConsent() {
  const ctx = useConsentContext();

  const can = React.useCallback(
    (category: ConsentCategory): boolean => {
      if (category === 'necessary') return true;
      if (!ctx || !ctx.hydrated) return false;
      return ctx.isCategoryGranted(category);
    },
    [ctx],
  );

  return {
    /** True once stored consent has hydrated on the client. */
    hydrated: ctx?.hydrated ?? false,
    /** Fail-closed per-category check. */
    can,
    /** Open the preference center (e.g. from a footer link). */
    openPreferenceCenter: ctx?.openPreferenceCenter ?? (() => {}),
    /** The raw context (null when no provider is mounted). */
    context: ctx,
  };
}
