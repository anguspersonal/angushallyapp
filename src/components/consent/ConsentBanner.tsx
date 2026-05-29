'use client';

/**
 * ConsentBanner (issue #140).
 *
 * Shown only when the user has not yet made a decision (and after hydration so
 * it never flashes for returning visitors). Offers the three required actions:
 *   - Accept all
 *   - Reject non-essential
 *   - Manage (opens the preference center)
 *
 * Neutral & tokenized — no persona skin lives in this component's CSS. Per-
 * persona skins (D1, #145/#146/#147) layer on top purely through CSS keyed off
 * the `data-surface` attribute we expose here: the banner is mounted site-wide
 * (outside the per-surface SurfaceShell), so it reads the current surface from
 * the shared registry itself — the same seam ChatPanel uses — and writes it to
 * `data-surface`. This is presentation wiring only; it does not touch any
 * consent logic. When the route has no surface, the attribute is omitted and
 * the neutral default chrome applies. Links to /privacy (content lands in #126).
 */

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveSurface } from '@/lib/surfaces';
import { useConsentContext } from '@/providers/ConsentProvider';
import styles from './ConsentBanner.module.css';

export function ConsentBanner() {
  const ctx = useConsentContext();
  const pathname = usePathname();
  const surface = resolveSurface(pathname)?.surface;

  if (!ctx || !ctx.shouldShowBanner) return null;

  return (
    <aside
      className={styles.banner}
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-body"
      data-surface={surface}
    >
      <div className={styles.panel}>
        <h2 id="consent-banner-title" className={styles.title}>
          Cookies &amp; your privacy
        </h2>
        <p id="consent-banner-body" className={styles.body}>
          I use a small set of cookies. Strictly-necessary ones keep the site
          working; the rest (security, analytics, functional) only load if you
          allow them. You can change your choice any time from the footer. Read
          the{' '}
          <Link href="/privacy" className={styles.link}>
            privacy policy
          </Link>
          .
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.button} ${styles.secondary}`}
            onClick={ctx.openPreferenceCenter}
          >
            Manage
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.secondary}`}
            onClick={ctx.rejectNonEssential}
          >
            Reject non-essential
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            onClick={ctx.acceptAll}
          >
            Accept all
          </button>
        </div>
      </div>
    </aside>
  );
}

export default ConsentBanner;
