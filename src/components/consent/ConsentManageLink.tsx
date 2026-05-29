'use client';

/**
 * ConsentManageLink (issue #140).
 *
 * A button styled as a link that re-opens the preference center. Drop it into
 * the footer / privacy page so consent is revocable any time. Renders nothing
 * when no ConsentProvider is mounted (fail-safe).
 *
 * Visually neutral: inherits surrounding type and uses the className the host
 * passes (e.g. the footer's link class) so it matches each surface's footer
 * without a bespoke skin.
 */

import * as React from 'react';
import { useConsentContext } from '@/providers/ConsentProvider';

export interface ConsentManageLinkProps {
  /** Class applied to the button (e.g. a footer link class) for host styling. */
  className?: string;
  /** Link text. Defaults to a neutral label. */
  children?: React.ReactNode;
}

export function ConsentManageLink({ className, children }: ConsentManageLinkProps) {
  const ctx = useConsentContext();
  if (!ctx) return null;

  return (
    <button
      type="button"
      className={className}
      onClick={ctx.openPreferenceCenter}
      style={{
        // Neutral defaults so a bare <ConsentManageLink/> reads as a link even
        // without a host className; a passed className can override these.
        background: 'none',
        border: 0,
        padding: 0,
        font: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
        textAlign: 'inherit' as React.CSSProperties['textAlign'],
      }}
    >
      {children ?? 'Cookie preferences'}
    </button>
  );
}

export default ConsentManageLink;
