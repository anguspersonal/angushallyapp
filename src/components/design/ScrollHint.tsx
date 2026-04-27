'use client';

import * as React from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './ScrollHint.module.css';

type ScrollHintProps = {
  targetRef: React.RefObject<HTMLElement | null>;
};

export function ScrollHint({ targetRef }: ScrollHintProps) {
  const reduceMotion = useReducedMotion();

  const scrollToTarget = () => {
    targetRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <motion.button
      type="button"
      className={styles.button}
      aria-label="Scroll to what I'm working on"
      onClick={scrollToTarget}
      animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
      transition={reduceMotion ? undefined : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={reduceMotion ? undefined : { y: 0, scale: 1.05 }}
    >
      <IconChevronDown size={20} stroke={1.5} aria-hidden />
    </motion.button>
  );
}
