'use client';

import * as React from 'react';
import styles from './DesktopIcon.module.css';

interface DesktopIconProps {
  /** Visible label rendered beneath the tile. */
  label: string;
  /** Click handler. Phase 4 wires this to the window manager. */
  onClick?: () => void;
  /** The IconTile element to render — DocumentIcon, FolderIcon, AppIcon, etc. */
  children: React.ReactNode;
  /**
   * Optional class applied to the outer button. Used by the parent surface to
   * position the icon on the desktop (see `styles.slotResume` for the default
   * Resume.pdf slot, top-right of the desktop area).
   */
  className?: string;
}

/**
 * Generic icon-with-label primitive for items that live directly on the
 * desktop (rather than inside the dock). Phase 3 ships with a single
 * Resume.pdf icon; the structure is shared so additional desktop items can
 * be added in later phases without a new component.
 */
export function DesktopIcon({ label, onClick, children, className }: DesktopIconProps) {
  return (
    <button
      type="button"
      className={`${styles.icon} ${className ?? ''}`.trim()}
      onClick={onClick}
      aria-label={`Open ${label}`}
    >
      <span className={styles.iconWrap}>{children}</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}

/** Pre-configured class names for the canonical desktop slots. */
export const desktopSlot = {
  resume: styles.slotResume,
} as const;

export default DesktopIcon;
