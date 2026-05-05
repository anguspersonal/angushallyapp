'use client';

import * as React from 'react';
import styles from './Wallpaper.module.css';

interface WallpaperProps {
  /** Optional override for the page-level title rendered as wallpaper type. */
  title?: string;
  /** Optional override for the help-text line below the title. */
  helpText?: string;
  /** Hide the title + help text overlay (e.g. during boot intro). */
  hideTitle?: boolean;
}

/**
 * Big-Sur-style mesh wallpaper for the macOS desktop redesign of /projects.
 *
 * Renders three layers:
 *   1. Mesh gradient base (day + night variants, tracks Mantine colour scheme)
 *   2. Faint film-grain overlay (keeps the gradient from looking digitally flat)
 *   3. Faded `MY PROJECTS` title + help-text overlay (the empty-desktop state)
 *
 * Positioned as a fixed full-viewport layer behind everything else, mirroring
 * GradientRoot so the wallpaper composes with existing chrome.
 */
export function Wallpaper({
  title = 'My Projects',
  helpText = 'Click an app to get started',
  hideTitle = false,
}: WallpaperProps) {
  return (
    <div className={styles.root} aria-hidden>
      <div className={styles.base} data-testid="wallpaper-base" />
      <div className={styles.grain} />
      {!hideTitle && (
        <div className={styles.titleStack}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.help}>{helpText}</p>
        </div>
      )}
    </div>
  );
}

export default Wallpaper;
