'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { AHMonogram } from './IconTile';
import { LiveClock } from './LiveClock';
import { useWindow } from './WindowContext';
import styles from './MenuBar.module.css';

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

// -----------------------------------------------------------------------------
// Menu item shape
// -----------------------------------------------------------------------------

interface AppMenuItemSpec {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Show a leading checkmark when true (macOS "Light Mode ✓" pattern). */
  checked?: boolean;
}

interface AppMenuDividerSpec {
  divider: true;
}

type AppMenuEntry = AppMenuItemSpec | AppMenuDividerSpec;

function isDivider(entry: AppMenuEntry): entry is AppMenuDividerSpec {
  return 'divider' in entry && entry.divider === true;
}

interface AppMenuProps {
  label: string;
  items: AppMenuEntry[];
}

function AppMenu({ label, items }: AppMenuProps) {
  return (
    <Menu
      position="bottom-start"
      offset={2}
      shadow="md"
      withinPortal
      transitionProps={{ duration: 80 }}
      classNames={{
        dropdown: styles.dropdown,
        item: styles.item,
        divider: styles.divider,
      }}
    >
      <Menu.Target>
        <button type="button" className={styles.appMenu}>
          {label}
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        {items.map((entry, idx) => {
          if (isDivider(entry)) {
            return <Menu.Divider key={`divider-${idx}`} />;
          }
          return (
            <Menu.Item
              key={entry.label}
              onClick={entry.onClick}
              disabled={entry.disabled}
              leftSection={
                entry.checked ? (
                  <IconCheck size={14} stroke={2} />
                ) : (
                  <span className={styles.menuItemCheckPlaceholder} aria-hidden />
                )
              }
            >
              {entry.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}

// -----------------------------------------------------------------------------
// Mantine color-scheme helper — mirrors `<ModeToggle>` so the toggle works
// before/after Mantine's keepTransitions flush, and persists across reloads.
// -----------------------------------------------------------------------------

function applyColorScheme(scheme: 'light' | 'dark', set: (s: 'light' | 'dark') => void) {
  set(scheme);
  if (typeof window === 'undefined') return;
  localStorage.setItem('mantine-color-scheme-value', scheme);
  document.documentElement.setAttribute('data-mantine-color-scheme', scheme);
  document.querySelectorAll('[data-mantine-color-scheme]').forEach((el) => {
    el.setAttribute('data-mantine-color-scheme', scheme);
  });
}

// -----------------------------------------------------------------------------
// MenuBar
// -----------------------------------------------------------------------------

/**
 * Top-of-viewport menu bar for the `/projects` macOS desktop.
 *
 * Layout: [AH] File Edit View Help  ......  Home Blog About Contact  Wed 6 May 10:23
 *
 * Menus:
 *   File — Close Window / Close All Windows (operate on focused window)
 *   Edit — kept as a wink (single disabled stub); real Macs grey-out Edit
 *          items when nothing is selected, so this is faithful to the metaphor
 *   View — Day Mode / Night Mode / Reduce Motion (display-mode toggles)
 *   Help — Keyboard Shortcuts… / About Projects (discovery surface)
 */
export function MenuBar() {
  const {
    openAbout,
    openKeyboardShortcuts,
    openConfirmHome,
    closeWindow,
    closeAllWindows,
    focusedId,
    windows,
    reduceMotion,
    toggleReduceMotion,
  } = useWindow();

  const { setColorScheme } = useMantineColorScheme({ keepTransitions: true });
  const computed = useComputedColorScheme('light');
  const isDark = computed === 'dark';

  const handleBrandClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    openConfirmHome({ x: rect.x, y: rect.y, w: rect.width, h: rect.height });
  };

  const fileMenu: AppMenuEntry[] = [
    {
      label: 'Close Window',
      onClick: focusedId ? () => closeWindow(focusedId) : undefined,
      disabled: !focusedId,
    },
    {
      label: 'Close All Windows',
      onClick: windows.length > 0 ? closeAllWindows : undefined,
      disabled: windows.length === 0,
    },
  ];

  // Edit kept as a wink — single disabled stub matches real macOS behaviour
  // (Cut/Copy/Paste are greyed out when nothing is selected).
  const editMenu: AppMenuEntry[] = [
    { label: 'Nothing to see here', disabled: true },
  ];

  const viewMenu: AppMenuEntry[] = [
    {
      label: 'Day Mode',
      checked: !isDark,
      onClick: () => applyColorScheme('light', setColorScheme),
    },
    {
      label: 'Night Mode',
      checked: isDark,
      onClick: () => applyColorScheme('dark', setColorScheme),
    },
    { divider: true },
    {
      label: 'Reduce Motion',
      checked: reduceMotion,
      onClick: toggleReduceMotion,
    },
  ];

  const helpMenu: AppMenuEntry[] = [
    {
      label: 'Keyboard Shortcuts…',
      onClick: () => openKeyboardShortcuts(),
    },
    {
      label: 'About Projects',
      onClick: () => openAbout(),
    },
  ];

  return (
    <header className={styles.bar} aria-label="Menu bar">
      <div className={styles.left}>
        <button
          type="button"
          className={styles.brandButton}
          onClick={handleBrandClick}
          aria-label="Go to home page"
        >
          <AHMonogram size={22} label="Angus Hally" />
        </button>
        <AppMenu label="File" items={fileMenu} />
        <AppMenu label="Edit" items={editMenu} />
        <AppMenu label="View" items={viewMenu} />
        <AppMenu label="Help" items={helpMenu} />
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
