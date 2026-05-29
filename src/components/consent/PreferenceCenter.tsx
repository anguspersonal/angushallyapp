'use client';

/**
 * PreferenceCenter (issue #140).
 *
 * Modal with a per-category toggle for every consent category. Strictly-
 * necessary is rendered read-only (forced on, disabled). Re-openable any time
 * from the footer / privacy page via ConsentManageLink → openPreferenceCenter.
 *
 * Local draft state lets the user toggle freely, then commit with "Save
 * preferences" (or take the accept-all / reject shortcuts). Neutral & tokenized
 * — per-persona skins (D1, #145/#146/#147) layer on top purely through CSS
 * keyed off the `data-surface` attribute exposed here. Mounted site-wide
 * (outside the per-surface SurfaceShell), it reads the current surface from the
 * shared registry — the same seam ChatPanel uses — and writes it to
 * `data-surface` on both the overlay and the dialog so a persona can skin the
 * scrim and the panel. Presentation wiring only; no consent-logic change.
 */

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { resolveSurface } from '@/lib/surfaces';
import { useConsentContext } from '@/providers/ConsentProvider';
import {
  CONSENT_CATEGORIES,
  type ToggleableCategory,
} from '@/lib/consent/types';
import styles from './PreferenceCenter.module.css';

export function PreferenceCenter() {
  const ctx = useConsentContext();
  const open = Boolean(ctx?.isPreferenceCenterOpen);
  const pathname = usePathname();
  const surface = resolveSurface(pathname)?.surface;

  // Local draft, seeded from current choices each time the dialog opens.
  const [draft, setDraft] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (open && ctx) {
      setDraft({ ...ctx.choices });
    }
  }, [open, ctx]);

  // Close on Escape.
  React.useEffect(() => {
    if (!open || !ctx) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') ctx.closePreferenceCenter();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, ctx]);

  if (!ctx || !open) return null;

  const toggle = (category: ToggleableCategory) => {
    setDraft((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const onSave = () => {
    const selection: Partial<Record<ToggleableCategory, boolean>> = {};
    for (const cat of CONSENT_CATEGORIES) {
      if (!cat.alwaysOn) {
        selection[cat.id as ToggleableCategory] = Boolean(draft[cat.id]);
      }
    }
    ctx.savePreferences(selection);
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      data-surface={surface}
      onClick={(e) => {
        if (e.target === e.currentTarget) ctx.closePreferenceCenter();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-pc-title"
        data-surface={surface}
      >
        <div className={styles.header}>
          <div>
            <h2 id="consent-pc-title" className={styles.title}>
              Privacy preferences
            </h2>
          </div>
          <button
            type="button"
            className={styles.close}
            aria-label="Close preferences"
            onClick={ctx.closePreferenceCenter}
          >
            &times;
          </button>
        </div>

        <p className={styles.intro}>
          Choose which categories of cookies you allow. Strictly-necessary
          cookies are always on. Changes take effect immediately.
        </p>

        <ul className={styles.categories}>
          {CONSENT_CATEGORIES.map((cat) => {
            const checked = cat.alwaysOn ? true : Boolean(draft[cat.id]);
            const inputId = `consent-toggle-${cat.id}`;
            return (
              <li key={cat.id} className={styles.category}>
                <div className={styles.categoryText}>
                  <label className={styles.categoryLabel} htmlFor={inputId}>
                    {cat.label}
                  </label>
                  <p className={styles.categoryDesc}>{cat.description}</p>
                  <span className={styles.categoryExamples}>
                    e.g. {cat.examples}
                  </span>
                </div>
                <span className={styles.switch}>
                  <input
                    id={inputId}
                    className={styles.switchInput}
                    type="checkbox"
                    role="switch"
                    checked={checked}
                    disabled={cat.alwaysOn}
                    aria-label={`${cat.label}${cat.alwaysOn ? ' (always on)' : ''}`}
                    aria-checked={checked}
                    onChange={() => !cat.alwaysOn && toggle(cat.id as ToggleableCategory)}
                  />
                  <span className={styles.track} aria-hidden="true" />
                  <span className={styles.thumb} aria-hidden="true" />
                </span>
              </li>
            );
          })}
        </ul>

        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.button} ${styles.secondary}`}
            onClick={ctx.rejectNonEssential}
          >
            Reject non-essential
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.secondary}`}
            onClick={ctx.acceptAll}
          >
            Accept all
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            onClick={onSave}
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreferenceCenter;
