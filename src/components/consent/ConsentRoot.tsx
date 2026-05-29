'use client';

/**
 * ConsentRoot (issue #140).
 *
 * Single site-wide mount point for the consent UI: the banner (shown until a
 * decision is made) and the preference center (opened on demand). Mounted once
 * in ClientLayout, OUTSIDE the per-surface SurfaceShell, so it appears on every
 * surface (default / blog / projects / persona) without each surface knowing
 * about it.
 *
 * Both children no-op render to null when not applicable, so this is cheap to
 * always mount.
 */

import * as React from 'react';
import { ConsentBanner } from './ConsentBanner';
import { PreferenceCenter } from './PreferenceCenter';

export function ConsentRoot() {
  return (
    <>
      <ConsentBanner />
      <PreferenceCenter />
    </>
  );
}

export default ConsentRoot;
