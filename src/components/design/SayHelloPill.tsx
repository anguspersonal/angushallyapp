'use client';

import * as React from 'react';
import Link from 'next/link';
import styles from './SayHelloPill.module.css';

type SayHelloPillProps = {
  children?: React.ReactNode;
  href?: string;
};

export function SayHelloPill({ children = 'Say hello', href = '/contact' }: SayHelloPillProps) {
  return (
    <Link href={href} className={styles.pill}>
      <span className={styles.dot} aria-hidden />
      {children}
    </Link>
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
