'use client';

import * as React from 'react';
import { Wallpaper } from './Wallpaper';
import { MenuBar } from './MenuBar';
import styles from './MacDesktop.module.css';

interface MacDesktopProps {
  /**
   * Optional content rendered on the desktop surface — desktop icons, floating
   * windows, etc. Phase 2 wires in the menu bar internally; the dock + window
   * manager arrive in Phases 3+4.
   */
  children?: React.ReactNode;
}

/**
 * Full-viewport macOS desktop shell for `/projects`.
 *
 * Phase 1 set up the wallpaper stage. Phase 2 layers the menu bar on top.
 * Later phases compose the dock, desktop icons, and window manager. Kept
 * intentionally minimal so each phase can layer in cleanly without
 * restructuring.
 */
export function MacDesktop({ children }: MacDesktopProps) {
  return (
    <div className={styles.root}>
      <Wallpaper />
      <MenuBar />
      {children}
    </div>
  );
}

export default MacDesktop;
