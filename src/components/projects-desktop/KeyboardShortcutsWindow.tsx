'use client';

import * as React from 'react';
import styles from './KeyboardShortcutsWindow.module.css';

/**
 * Keyboard Shortcuts — system window opened from Help → Keyboard Shortcuts.
 *
 * Honest documentation of what's actually wired in this surface, not the
 * decorative shortcuts shown on real Mac menus. The `Esc` binding is the
 * one real keyboard shortcut today; the rest are pointer interactions
 * advertised here so they're discoverable.
 */
export function KeyboardShortcutsWindow() {
  return (
    <div className={styles.root}>
      <p className={styles.intro}>
        A handful of ways to drive this desktop without a mouse — or with one.
      </p>

      <Section title="Keyboard">
        <Row keys={['Esc']} action="Close the focused window" />
        <Row keys={['Tab']} action="Move focus through interactive elements" />
        <Row keys={['Shift', 'Tab']} action="Move focus backwards" />
        <Row keys={['Enter']} action="Open the focused dock or desktop icon" />
      </Section>

      <Section title="Pointer">
        <Row keys={['Click']} action="Open or focus the icon under the cursor" />
        <Row keys={['Drag']} action="Move a window by its header" />
        <Row keys={['Click ×']} action="Close a window via its red traffic light" />
      </Section>

      <Section title="Menus">
        <Row keys={['File']} action="Close the focused window or all windows" />
        <Row keys={['View']} action="Switch day/night mode, reduce motion" />
        <Row keys={['Help']} action="This window, plus About" />
      </Section>

      <p className={styles.footnote}>
        On real Macs you would expect <kbd className={styles.kbd}>⌘W</kbd> here too.
        Browsers reserve those combinations for tab control, so the menus offer
        equivalents instead.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <ul className={styles.list}>{children}</ul>
    </section>
  );
}

function Row({ keys, action }: { keys: string[]; action: string }) {
  return (
    <li className={styles.row}>
      <span className={styles.keys}>
        {keys.map((key, i) => (
          <React.Fragment key={key}>
            {i > 0 && <span className={styles.plus}>+</span>}
            <kbd className={styles.kbd}>{key}</kbd>
          </React.Fragment>
        ))}
      </span>
      <span className={styles.action}>{action}</span>
    </li>
  );
}

export default KeyboardShortcutsWindow;
