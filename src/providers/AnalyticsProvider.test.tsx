/** @vitest-environment jsdom */
import * as React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { ConsentProvider, useConsentContext, type ConsentContextValue } from '@/providers/ConsentProvider';
import { defaultRecord, acceptAll } from '@/lib/consent/store';
import type { ConsentRecord } from '@/lib/consent/types';

/**
 * Gating behaviour (issue #141): the AnalyticsProvider must NOT initialise
 * PostHog until the analytics consent gate is open, and must tear it down when
 * consent is revoked. We mock the analytics client so no posthog-js / network is
 * involved and assert purely on init/shutdown calls driven by consent.
 */

const initAnalytics = vi.fn((..._args: unknown[]): Promise<unknown> => Promise.resolve({}));
const shutdownAnalytics = vi.fn((..._args: unknown[]): void => {});
const capturePageview = vi.fn((..._args: unknown[]): void => {});

vi.mock('@/lib/analytics/client', () => ({
  initAnalytics: (...args: unknown[]) => initAnalytics(...args),
  shutdownAnalytics: (...args: unknown[]) => shutdownAnalytics(...args),
  capturePageview: (...args: unknown[]) => capturePageview(...args),
}));

// Import AFTER the mock is registered.
import { AnalyticsProvider } from './AnalyticsProvider';

/**
 * Renders the provider inside a ConsentProvider seeded with `record`, and
 * exposes the live consent context (captured via a sibling) so a test can drive
 * grant/revoke transitions at runtime.
 */
function renderWithConsent(record: ConsentRecord) {
  const captured: { ctx: ConsentContextValue | null } = { ctx: null };

  function ContextProbe() {
    captured.ctx = useConsentContext();
    return null;
  }

  render(
    <ConsentProvider initialRecord={record}>
      <ContextProbe />
      <AnalyticsProvider />
    </ConsentProvider>,
  );

  return captured;
}

beforeEach(() => {
  initAnalytics.mockClear();
  shutdownAnalytics.mockClear();
  capturePageview.mockClear();
});

describe('AnalyticsProvider — consent gates init (guardrail)', () => {
  it('does not initialise analytics before an analytics-consent decision', async () => {
    await act(async () => {
      renderWithConsent(defaultRecord());
    });
    expect(initAnalytics).not.toHaveBeenCalled();
    expect(capturePageview).not.toHaveBeenCalled();
  });

  it('initialises analytics when consent is granted up-front', async () => {
    await act(async () => {
      renderWithConsent(acceptAll());
    });
    expect(initAnalytics).toHaveBeenCalledTimes(1);
  });
});

describe('AnalyticsProvider — reacts to runtime consent changes', () => {
  it('inits on grant and shuts down on revoke', async () => {
    let captured!: { ctx: ConsentContextValue | null };
    await act(async () => {
      captured = renderWithConsent(defaultRecord());
    });

    // No consent yet → no init.
    expect(initAnalytics).not.toHaveBeenCalled();

    // Grant analytics → init fires.
    await act(async () => {
      captured.ctx?.setCategory('analytics', true);
    });
    expect(initAnalytics).toHaveBeenCalled();

    // Revoke analytics → shutdown fires (revocation stops capture).
    shutdownAnalytics.mockClear();
    await act(async () => {
      captured.ctx?.setCategory('analytics', false);
    });
    expect(shutdownAnalytics).toHaveBeenCalled();
  });
});
