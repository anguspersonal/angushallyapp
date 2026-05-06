'use client';

import * as React from 'react';
import type { WindowKind } from './WindowContext';
import styles from './SystemWindow.module.css';

interface SystemWindowProps {
  kind: WindowKind;
}

/**
 * System window — single-pane layout for About and Resume.
 *
 * About: embeds /about page content via iframe
 * Resume: embeds /cv page content via iframe
 *
 * No internal CTA — content is right there.
 */
export function SystemWindow({ kind }: SystemWindowProps) {
  const src = React.useMemo(() => {
    switch (kind.type) {
      case 'about':
        return '/about';
      case 'resume':
        return '/cv';
      default:
        return null;
    }
  }, [kind]);

  if (!src) {
    return (
      <div className={styles.root}>
        <p className={styles.error}>Unknown system window type</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <iframe
        src={src}
        className={styles.iframe}
        title={kind.type === 'about' ? 'About' : 'Resume'}
        sandbox="allow-same-origin allow-scripts"
        loading="lazy"
      />
    </div>
  );
}

export default SystemWindow;
