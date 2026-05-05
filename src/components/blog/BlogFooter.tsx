'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
} from '@tabler/icons-react';
import styles from './BlogChrome.module.css';

const MAIN: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const WORK_WITH_ME: { label: string; href: string }[] = [
  { label: 'Consulting', href: '/work-with-me/consulting' },
  { label: 'Web Development', href: '/work-with-me/webdev' },
  { label: 'Maths Tutoring', href: '/work-with-me/maths' },
];

export function BlogFooter() {
  const year = new Date().getFullYear();
  const buildInfo = process.env.NEXT_PUBLIC_BUILD_NUMBER;
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <footer className={styles.footer}>
      <div className={styles.dateline}>
        <span>Vol. I · No. I · MMXXVI</span>
        <span className={styles.datelineCenter}>— The Back Page —</span>
        <span className={styles.datelineRight}>London · Est. 2025</span>
      </div>

      <div className={styles.cols}>
        <div className={styles.col}>
          <h5 className={styles.colHeading}>Lead</h5>
          <div className={styles.lede}>
            Say hello<span className={styles.ledeAccent}>.</span>
          </div>
          <div className={styles.ledeSub}>
            The desk is open for notes, projects and polite arguments.
          </div>
          <Link href="/contact" className={styles.cta}>
            Get in touch
          </Link>
        </div>

        <div className={styles.col}>
          <h5 className={styles.colHeading}>Main</h5>
          {MAIN.map((s) => (
            <Link key={s.href} href={s.href} className={styles.colLink}>
              {s.label}
            </Link>
          ))}
        </div>

        <div className={styles.col}>
          <h5 className={styles.colHeading}>Work with me</h5>
          {WORK_WITH_ME.map((s) => (
            <Link key={s.href} href={s.href} className={styles.colLink}>
              {s.label}
            </Link>
          ))}
        </div>

        <div className={styles.col}>
          <h5 className={styles.colHeading}>Connect</h5>
          <div className={styles.icons}>
            <a
              className={styles.icon}
              href="https://www.linkedin.com/in/angus-hally-9ab66a87/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <IconBrandLinkedin size={14} stroke={1.5} />
            </a>
            <a
              className={styles.icon}
              href="https://github.com/anguspersonal"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <IconBrandGithub size={14} stroke={1.5} />
            </a>
            <a
              className={styles.icon}
              href="https://www.instagram.com/hallyangus/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <IconBrandInstagram size={14} stroke={1.5} />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.colophon}>
        <span>
          Set in <em>Fraunces</em> &amp; Ubuntu on a cream stock. Hand-built in
          London with care, and the occasional flat white.
        </span>
        <span className={styles.colophonStrap}>RSS · Atom · Email</span>
      </div>

      <div className={styles.bottomRule}>
        <div className={styles.dots} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <span>© {year} Angus Hally · All rights reserved</span>
        <span>
          — 30 —
          {isDev ? ' · Dev Environment' : buildInfo ? ` · Build: ${buildInfo}` : ''}
        </span>
      </div>
    </footer>
  );
}

export default BlogFooter;
