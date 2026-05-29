/** @vitest-environment jsdom */
import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { ConsentProvider } from '@/providers/ConsentProvider';
import { useConsentContext } from '@/providers/ConsentProvider';
import { useConsentGate } from './useConsentGate';
import { acceptAll, defaultRecord, rejectNonEssential, savePreferences } from './store';
import type { ConsentRecord } from './types';

/**
 * Behaviour tests for the consent GATE (issue #140): the gate allows or blocks
 * a category, and revoking a category flips it back to blocked. We seed the
 * provider with an explicit record (which marks it hydrated) so the gate
 * reflects a real decision rather than the fail-closed default.
 */

function wrapperFor(record: ConsentRecord) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <ConsentProvider initialRecord={record}>{children}</ConsentProvider>;
  };
}

describe('useConsentGate', () => {
  it('necessary is always allowed, even with no provider', () => {
    const { result } = renderHook(() => useConsentGate('necessary'));
    expect(result.current).toBe(true);
  });

  it('fails closed for non-necessary categories with no provider', () => {
    const { result } = renderHook(() => useConsentGate('analytics'));
    expect(result.current).toBe(false);
  });

  it('blocks every non-necessary category before a decision (default record)', () => {
    const wrapper = wrapperFor(defaultRecord());
    expect(renderHook(() => useConsentGate('security'), { wrapper }).result.current).toBe(false);
    expect(renderHook(() => useConsentGate('analytics'), { wrapper }).result.current).toBe(false);
    expect(renderHook(() => useConsentGate('functional'), { wrapper }).result.current).toBe(false);
  });

  it('allows every category after acceptAll', () => {
    const wrapper = wrapperFor(acceptAll());
    expect(renderHook(() => useConsentGate('security'), { wrapper }).result.current).toBe(true);
    expect(renderHook(() => useConsentGate('analytics'), { wrapper }).result.current).toBe(true);
    expect(renderHook(() => useConsentGate('functional'), { wrapper }).result.current).toBe(true);
  });

  it('blocks non-essential after rejectNonEssential but keeps necessary', () => {
    const wrapper = wrapperFor(rejectNonEssential());
    expect(renderHook(() => useConsentGate('analytics'), { wrapper }).result.current).toBe(false);
    expect(renderHook(() => useConsentGate('necessary'), { wrapper }).result.current).toBe(true);
  });

  it('allows exactly the categories selected in the preference center', () => {
    const wrapper = wrapperFor(savePreferences({ analytics: true }));
    expect(renderHook(() => useConsentGate('analytics'), { wrapper }).result.current).toBe(true);
    expect(renderHook(() => useConsentGate('security'), { wrapper }).result.current).toBe(false);
    expect(renderHook(() => useConsentGate('functional'), { wrapper }).result.current).toBe(false);
  });
});

describe('gate reacts to runtime consent changes (revocation)', () => {
  it('flips analytics from blocked → allowed → blocked as the user changes consent', () => {
    const wrapper = wrapperFor(defaultRecord());

    // Render the gate and the context together so we can drive transitions.
    const { result } = renderHook(
      () => ({
        analyticsAllowed: useConsentGate('analytics'),
        ctx: useConsentContext(),
      }),
      { wrapper },
    );

    // Initially blocked.
    expect(result.current.analyticsAllowed).toBe(false);

    // Grant analytics → gate allows.
    act(() => {
      result.current.ctx?.setCategory('analytics', true);
    });
    expect(result.current.analyticsAllowed).toBe(true);

    // Revoke analytics → gate blocks again (revocation stops it).
    act(() => {
      result.current.ctx?.setCategory('analytics', false);
    });
    expect(result.current.analyticsAllowed).toBe(false);
  });

  it('acceptAll then revoke a single category leaves the others allowed', () => {
    const wrapper = wrapperFor(acceptAll());
    const { result } = renderHook(
      () => ({
        analytics: useConsentGate('analytics'),
        security: useConsentGate('security'),
        ctx: useConsentContext(),
      }),
      { wrapper },
    );

    expect(result.current.analytics).toBe(true);
    expect(result.current.security).toBe(true);

    act(() => {
      result.current.ctx?.setCategory('analytics', false);
    });

    expect(result.current.analytics).toBe(false);
    expect(result.current.security).toBe(true);
  });
});
