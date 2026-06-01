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
 * Neutral & tokenized here. Per-persona skins (D1, #145/#146/#147) layer on via
 * the `data-surface` attribute below: the banner is mounted site-wide (outside
 * SurfaceShell), so it resolves the active surface itself and exposes it as
 * `data-surface` — exactly as ChatPanel does — letting a persona repaint it by
 * overriding the --site-* / --button-* tokens it already reads, with NO change
 * to this component's CSS. Links to /privacy (content from #126).
 */

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveSurface } from '@/lib/surfaces';
import { useConsentContext } from '@/providers/ConsentProvider';
import styles from './ConsentBanner.module.css';

export function ConsentBanner() {
  const ctx = useConsentContext();
  // Expose the active persona surface so personas can skin the banner via
  // [data-surface="<persona>"] token overrides. Omitted on surfaceless routes
  // (default chrome), so today's neutral look is unchanged there.
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
