'use client';

import * as React from 'react';
import type { WindowKind } from './WindowContext';
import styles from './SystemWindow.module.css';

interface SystemWindowProps {
  kind: WindowKind;
}

/**
 * System window — single-pane layout for the About surface.
 *
 * Embeds the `/about` page in an iframe so its content stays the source of
 * truth for both the standalone route and the in-desktop window.
 *
 * Resume previously routed through here too; it now has its own
 * `<ResumeWindow>` with PDF embed and a download action.
 */
export function SystemWindow({ kind }: SystemWindowProps) {
  if (kind.type !== 'about') {
    return (
      <div className={styles.root}>
        <p className={styles.error}>Unknown system window type</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <iframe
        src="/about"
        className={styles.iframe}
        title="About"
        sandbox="allow-same-origin allow-scripts"
        loading="lazy"
      />
    </div>
  );
}

export default SystemWindow;
