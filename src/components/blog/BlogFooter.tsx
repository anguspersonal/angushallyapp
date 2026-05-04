'use client';

import * as React from 'react';
import Link from 'next/link';
import styles from './BlogChrome.module.css';

const SECTIONS: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const FIND_ME: { label: string; href: string; external?: boolean }[] = [
  { label: 'GitHub', href: 'https://github.com/anguspersonal', external: true },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/angushally', external: true },
  { label: 'Email', href: 'mailto:angus.hally@gmail.com' },
];

export function BlogFooter() {
  const year = new Date().getFullYear();
  return (
    <>
      <footer className={styles.footer}>
        <div>
          <h5 className={styles.footerHeading}>Sections</h5>
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className={styles.footerLink}>
              {s.label}
            </Link>
          ))}
        </div>

        <div className={styles.colophon}>
          <h5 className={styles.footerHeading}>Colophon</h5>
          <p>
            Set in Fraunces &amp; Ubuntu on a cream stock — or its dark equivalent if you
            prefer the late-edition print run.
          </p>
          <p>
            Hand-set in London. Earlier work has been left in its original form, with all
            its dents and certainties.
          </p>
        </div>

        <div>
          <h5 className={styles.footerHeading}>Find me</h5>
          {FIND_ME.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                {link.label}
              </a>
            ) : (
              <a key={link.href} href={link.href} className={styles.footerLink}>
                {link.label}
              </a>
            ),
          )}
        </div>
      </footer>

      <div className={styles.bottomRule}>
        <span>© {year} Angus Hally · The Hally Herald</span>
        <span>RSS · Atom · Email</span>
      </div>
    </>
  );
}

export default BlogFooter;
