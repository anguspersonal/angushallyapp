'use client';

import * as React from 'react';
import { Wallpaper } from './Wallpaper';
import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { DesktopIcon, desktopSlot } from './DesktopIcon';
import { DocumentIcon } from './IconTile';
import styles from './MacDesktop.module.css';

interface MacDesktopProps {
  /**
   * Optional extra content rendered on the desktop surface (e.g. floating
   * windows from the Phase 4 window manager). The wallpaper, menu bar, dock,
   * and Resume.pdf desktop icon are mounted internally so the page surface
   * stays a single `<MacDesktop />`.
   */
  children?: React.ReactNode;
}

/**
 * Full-viewport macOS desktop shell for `/projects`.
 *
 * Layering (z-axis, bottom → top):
 *   Wallpaper → DesktopIcon(s) → Dock (z=90) → MenuBar (z=100) → children
 *
 * Phase 4 will add the window manager, which mounts windows via `children`
 * rendered by the WindowContext provider — keeping that responsibility outside
 * MacDesktop preserves the "MacDesktop describes static chrome" contract.
 */
export function MacDesktop({ children }: MacDesktopProps) {
  return (
    <div className={styles.root}>
      <Wallpaper />
      <MenuBar />

      <DesktopIcon
        label="Resume.pdf"
        className={desktopSlot.resume}
        // Phase 4 wires this to WindowContext.openResume().
        onClick={() => {}}
      >
        <DocumentIcon size={64} label="Resume.pdf" badge="PDF" />
      </DesktopIcon>

      <Dock />

      {children}
    </div>
  );
}

export default MacDesktop;
