'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './SayHelloPill.module.css';

const MotionLink = motion.create(Link);

const waveVariants = {
  rest: { width: 0, opacity: 0, marginLeft: 0, rotate: 0 },
  wave: {
    width: 'auto',
    opacity: 1,
    marginLeft: '0.4em',
    rotate: [0, 20, -10, 20, -10, 0],
  },
};

const waveTransition = {
  width: { duration: 0.2 },
  opacity: { duration: 0.2 },
  marginLeft: { duration: 0.2 },
  rotate: { duration: 0.8 },
};

type SayHelloPillProps = {
  children?: React.ReactNode;
  href?: string;
};

export function SayHelloPill({ children = 'Say hello', href = '/contact' }: SayHelloPillProps) {
  return (
    <MotionLink
      href={href}
      className={styles.pill}
      initial="rest"
      animate="rest"
      whileHover="wave"
      whileFocus="wave"
    >
      <span className={styles.dot} aria-hidden />
      {children}
      <motion.span
        variants={waveVariants}
        transition={waveTransition}
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          verticalAlign: 'middle',
          transformOrigin: '50% 80%',
        }}
      >
        👋
      </motion.span>
    </MotionLink>
  );
}

type PrimaryPillButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

/** Solid CTA pill (amendment section 5), for `<button type="submit">` etc. */
export function PrimaryPillButton({ children, className, type = 'submit', ...props }: PrimaryPillButtonProps) {
  return (
    <button type={type} className={[styles.pill, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </button>
  );
}
