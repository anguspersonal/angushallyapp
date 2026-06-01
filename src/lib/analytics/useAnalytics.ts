'use client';

/**
 * useAnalytics — ergonomic, consent-safe capture hook (issue #141).
 *
 * Wraps captureEvent so call sites don't have to thread the current pathname:
 * the hook reads it from usePathname() and tags every event with surface
 * attribution automatically. Like the underlying helper, it no-ops when
 * analytics is not active (no key / no consent), so consumers never need to
 * guard.
 *
 *   const { capture } = useAnalytics();
 *   capture('cta_clicked', { cta: 'hire-me' });
 */

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { captureEvent } from './client';
import type { AnalyticsEventName, AnalyticsEventProperties } from './events';

export interface UseAnalytics {
  /** Capture a typed event, auto-tagged with the current surface attribution. */
  capture: <E extends AnalyticsEventName>(
    event: E,
    properties?: AnalyticsEventProperties<E>,
  ) => void;
}

export function useAnalytics(): UseAnalytics {
  const pathname = usePathname();

  const capture = React.useCallback(
    <E extends AnalyticsEventName>(event: E, properties?: AnalyticsEventProperties<E>) => {
      captureEvent(
        event,
        (properties ?? ({} as AnalyticsEventProperties<E>)),
        pathname,
      );
    },
    [pathname],
  );

  return { capture };
}
