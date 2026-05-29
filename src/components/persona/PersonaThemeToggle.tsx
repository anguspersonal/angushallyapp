'use client';

import * as React from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import { useReducedMotion } from 'framer-motion';
import styles from './PersonaThemeToggle.module.css';

/**
 * Day/night toggle for persona pages.
 *
 * Reuses the EXISTING Mantine color-scheme state/persistence — exactly the
 * approach in `src/components/ModeToggle.tsx` — so there is NO new preference
 * store. Toggling here is identical to toggling on the main site; the choice
 * persists via the same `mantine-color-scheme-value` key and the same
 * `data-mantine-color-scheme` attribute.
 *
 * Visuals are skinnable: pass `className` to layer persona styles on top of
 * the neutral defaults, and `iconSize` / aria text to fit the persona's
 * chrome. The component is unopinionated about colour — it inherits
 * `currentColor` so the surrounding persona palette drives it.
 */
export interface PersonaThemeToggleProps {
  /** Extra class merged onto the button for persona skinning. */
  className?: string;
  /** Icon size in px. Defaults to 22 (matches the main-site toggle). */
  iconSize?: number;
  /** Accessible label / tooltip. Defaults to a generic day/night string. */
  label?: string;
}

export function PersonaThemeToggle({
  className,
  iconSize = 22,
  label = 'Toggle night/day mode',
}: PersonaThemeToggleProps) {
  const { setColorScheme } = useMantineColorScheme({ keepTransitions: true });
  const reduceMotion = useReducedMotion();

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Derive current mode from which icon is rendered (CSS toggles them via the
    // data-mantine-color-scheme attribute), matching ModeToggle's approach so
    // both stay in lockstep.
    const sunIcon = event.currentTarget.querySelector(`.${styles.sunIcon}`);
    const isDark = sunIcon ? getComputedStyle(sunIcon).display !== 'none' : false;
    const nextScheme = isDark ? 'light' : 'dark';

    setColorScheme(nextScheme);
    // Persist + reflect on every surface, identical to the main-site toggle.
    localStorage.setItem('mantine-color-scheme-value', nextScheme);
    document.documentElement.setAttribute('data-mantine-color-scheme', nextScheme);
    document.querySelectorAll('[data-mantine-color-scheme]').forEach((element) => {
      element.setAttribute('data-mantine-color-scheme', nextScheme);
    });
  };

  return (
    <button
      type="button"
      className={[styles.toggle, reduceMotion ? '' : styles.toggleAnimated, className]
        .filter(Boolean)
        .join(' ')}
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <IconSun className={`${styles.icon} ${styles.sunIcon}`} size={iconSize} stroke={1.5} />
      <IconMoonStars className={`${styles.icon} ${styles.moonIcon}`} size={iconSize} stroke={1.5} />
    </button>
  );
}

export default PersonaThemeToggle;
