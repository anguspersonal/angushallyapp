'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu } from '@mantine/core';
import { AHMonogram } from './IconTile';
import { LiveClock } from './LiveClock';
import styles from './MenuBar.module.css';

/**
 * Decorative app-menu labels in the macOS menu bar. Each opens a single
 * disabled stub item — the menus are part of the metaphor, not real surfaces.
 * If real items ever land they go here.
 */
const APP_MENUS = ['File', 'Edit', 'View', 'Help'] as const;

/**
 * Right-zone site navigation. `Projects` is intentionally absent — visitors
 * are already on the projects desktop, so showing it would be a self-link.
 */
const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

interface AppMenuProps {
  label: string;
}

function AppMenu({ label }: AppMenuProps) {
  return (
    <Menu
      position="bottom-start"
      offset={2}
      shadow="md"
      withinPortal
      transitionProps={{ duration: 80 }}
    >
      <Menu.Target>
        <button type="button" className={styles.appMenu}>
          {label}
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item disabled>Nothing to see here</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

/**
 * Top-of-viewport menu bar for the `/projects` macOS desktop.
 *
 * Layout: [AH] File Edit View Help  ......  Home Blog About Contact  Wed 6 May 10:23
 *
 * The AH monogram is wired as a button now so Phase 4 can connect it to the
 * window manager (clicking opens the About window) without restructuring. Site
 * nav links route normally as standard `<Link>`s — they remain functional even
 * before the window manager exists, which is the right behaviour: the menu bar
 * is "system chrome", not part of the playful desktop metaphor.
 */
export function MenuBar() {
  return (
    <header className={styles.bar} aria-label="Menu bar">
      <div className={styles.left}>
        <button
          type="button"
          className={styles.brandButton}
          // Phase 4 wires this to WindowContext.openAbout(). Until the window
          // engine exists the click is intentionally a no-op.
          onClick={() => {}}
          aria-label="Open About window"
        >
          <AHMonogram size={22} label="Angus Hally" />
        </button>
        {APP_MENUS.map((label) => (
          <AppMenu key={label} label={label} />
        ))}
      </div>

      <div className={styles.right}>
        <nav className={styles.navGroup} aria-label="Site navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={label} href={href} className={styles.navLink}>
              {label}
            </Link>
          ))}
        </nav>
        <LiveClock className={styles.clock} />
      </div>
    </header>
  );
}

export default MenuBar;
