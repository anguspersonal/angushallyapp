'use client';

import * as React from 'react';
import { Wallpaper } from './Wallpaper';
import styles from './MacDesktop.module.css';

interface MacDesktopProps {
  /**
   * Optional content rendered on the desktop surface — desktop icons, floating
   * windows, etc. Phase 1 has none; menu bar + dock arrive in Phases 2+3 and
   * the window manager in Phase 4.
   */
  children?: React.ReactNode;
}

/**
 * Full-viewport macOS desktop shell for `/projects`.
 *
 * Phase 1 renders only the wallpaper. Later phases compose the menu bar, dock,
 * desktop icons, and window manager on top of this stage. Kept intentionally
 * minimal so each phase can layer in cleanly without restructuring.
 */
export function MacDesktop({ children }: MacDesktopProps) {
  return (
    <div className={styles.root}>
      <Wallpaper />
      {children}
    </div>
  );
}

export default MacDesktop;
