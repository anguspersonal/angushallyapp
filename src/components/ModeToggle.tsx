'use client';

import * as React from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { IconMoonStars, IconSun } from '@tabler/icons-react';
import { useReducedMotion } from 'framer-motion';
import styles from './ModeToggle.module.css';

export function ModeToggle() {
  const { setColorScheme } = useMantineColorScheme({ keepTransitions: true });
  const reduceMotion = useReducedMotion();

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const sunIcon = event.currentTarget.querySelector(`.${styles.sunIcon}`);
    const isDark = sunIcon ? getComputedStyle(sunIcon).display !== 'none' : false;
    const nextScheme = isDark ? 'light' : 'dark';

    setColorScheme(nextScheme);
    localStorage.setItem('mantine-color-scheme-value', nextScheme);
    document.documentElement.setAttribute('data-mantine-color-scheme', nextScheme);
    document.querySelectorAll('[data-mantine-color-scheme]').forEach((element) => {
      element.setAttribute('data-mantine-color-scheme', nextScheme);
    });
  };

  return (
    <button
      type="button"
      className={`${styles.toggle} ${reduceMotion ? '' : styles.toggleAnimated}`}
      onClick={toggle}
      aria-label="Toggle night/day mode"
      title="Toggle night/day mode"
    >
      <IconSun className={`${styles.icon} ${styles.sunIcon}`} size={22} stroke={1.5} />
      <IconMoonStars className={`${styles.icon} ${styles.moonIcon}`} size={22} stroke={1.5} />
    </button>
  );
}
