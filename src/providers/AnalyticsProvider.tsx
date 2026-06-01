'use client';

/**
 * AnalyticsProvider — consent-gated PostHog lifecycle + pageview capture (issue #141).
 *
 * This is the ONLY place that drives PostHog init / teardown. It binds the D0
 * consent gate (#140) to the analytics client:
 *
 *   - analytics consent granted  → initAnalytics() (no-ops if no key)
 *   - analytics consent revoked  → shutdownAnalytics() (stops capture)
 *
 * Both guardrails hold structurally: initAnalytics no-ops without a key, and
 * this effect only ever calls it when `useConsentGate('analytics')` is true.
 * So nothing is ever sent without BOTH a key and consent.
 *
 * Once active, it captures an App Router $pageview on every pathname change
 * (capture_pageview is disabled in the client init so SPA navigations are
 * captured here, not missed). Renders nothing.
 *
 * Mount once, inside ConsentProvider, in ClientLayout.
 */

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useConsentGate } from '@/lib/consent/useConsentGate';
import { initAnalytics, shutdownAnalytics, capturePageview } from '@/lib/analytics/client';

export function AnalyticsProvider({ children }: { children?: React.ReactNode }) {
  const analyticsAllowed = useConsentGate('analytics');
  const pathname = usePathname();
  // Bumped when init resolves so the pageview effect re-runs and fires the
  // first pageview immediately after analytics comes online.
  const [ready, setReady] = React.useState(false);

  // Lifecycle: init on consent, tear down on revoke. initAnalytics() itself
  // no-ops when no key is configured, so this is safe in keyless deployments.
  React.useEffect(() => {
    let cancelled = false;

    if (!analyticsAllowed) {
      shutdownAnalytics();
      setReady(false);
      return;
    }

    initAnalytics().then((instance) => {
      if (cancelled) return;
      setReady(instance !== null);
    });

    return () => {
      cancelled = true;
    };
  }, [analyticsAllowed]);

  // Capture a pageview on every route change (and once analytics becomes ready).
  // capturePageview no-ops when analytics isn't active, so the `ready` guard is
  // belt-and-braces rather than load-bearing.
  React.useEffect(() => {
    if (!ready) return;
    capturePageview(pathname);
  }, [ready, pathname]);

  return <>{children}</>;
}

export default AnalyticsProvider;
