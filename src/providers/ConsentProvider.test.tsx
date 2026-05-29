/** @vitest-environment jsdom */
import * as React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { ConsentProvider, useConsentContext } from './ConsentProvider';
import { CONSENT_STORAGE_KEY } from '@/lib/consent/types';
import { readConsent } from '@/lib/consent/store';

/**
 * Runtime tests for ConsentProvider (issue #140): hydration, banner visibility,
 * and that every transition persists to localStorage (jsdom provides a real
 * localStorage here).
 */

function wrapper({ children }: { children: React.ReactNode }) {
  return <ConsentProvider>{children}</ConsentProvider>;
}

describe('ConsentProvider hydration + persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('hydrates and shows the banner when no decision is stored', () => {
    const { result } = renderHook(() => useConsentContext(), { wrapper });
    expect(result.current?.hydrated).toBe(true);
    expect(result.current?.needsDecision).toBe(true);
    expect(result.current?.shouldShowBanner).toBe(true);
  });

  it('acceptAll persists and hides the banner', () => {
    const { result } = renderHook(() => useConsentContext(), { wrapper });

    act(() => {
      result.current?.acceptAll();
    });

    expect(result.current?.shouldShowBanner).toBe(false);
    expect(result.current?.isCategoryGranted('analytics')).toBe(true);

    // Persisted to localStorage.
    const stored = readConsent(window.localStorage);
    expect(stored.decidedAt).not.toBeNull();
    expect(stored.choices.analytics).toBe(true);
  });

  it('rejectNonEssential persists necessary-only and hides the banner', () => {
    const { result } = renderHook(() => useConsentContext(), { wrapper });

    act(() => {
      result.current?.rejectNonEssential();
    });

    expect(result.current?.shouldShowBanner).toBe(false);
    expect(result.current?.isCategoryGranted('analytics')).toBe(false);
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).not.toBeNull();
  });

  it('a returning visitor with stored consent does NOT see the banner', () => {
    // First mount: decide.
    const first = renderHook(() => useConsentContext(), { wrapper });
    act(() => {
      first.result.current?.savePreferences({ analytics: true });
    });

    // Second mount: fresh provider reads the stored decision.
    const second = renderHook(() => useConsentContext(), { wrapper });
    expect(second.result.current?.shouldShowBanner).toBe(false);
    expect(second.result.current?.isCategoryGranted('analytics')).toBe(true);
  });

  it('setCategory persists a single-category change immediately', () => {
    const { result } = renderHook(() => useConsentContext(), { wrapper });

    act(() => {
      result.current?.acceptAll();
    });
    act(() => {
      result.current?.setCategory('analytics', false);
    });

    expect(result.current?.isCategoryGranted('analytics')).toBe(false);
    expect(readConsent(window.localStorage).choices.analytics).toBe(false);
  });

  it('opens and closes the preference center', () => {
    const { result } = renderHook(() => useConsentContext(), { wrapper });
    expect(result.current?.isPreferenceCenterOpen).toBe(false);

    act(() => result.current?.openPreferenceCenter());
    expect(result.current?.isPreferenceCenterOpen).toBe(true);

    act(() => result.current?.closePreferenceCenter());
    expect(result.current?.isPreferenceCenterOpen).toBe(false);
  });
});
