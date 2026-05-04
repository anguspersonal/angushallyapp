'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { ModeToggle } from '@/components/ModeToggle';
import styles from './BlogChrome.module.css';

type NavLink = { href: string; label: string };

const NAV: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

const TAGLINE = 'Vol. I · Always in print';

function isCurrent(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BlogHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.dots} aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <div className={styles.tagline}>{TAGLINE}</div>

      <nav className={styles.nav}>
        {NAV.map((link) => {
          const current = isCurrent(pathname, link.href);
          const className = current
            ? `${styles.navLink} ${styles.navLinkCurrent}`
            : styles.navLink;
          return (
            <Link key={link.href} href={link.href} className={className}>
              {link.label}
            </Link>
          );
        })}

        <Link href="/contact" className={styles.navContact}>
          Contact
        </Link>

        <div className={styles.navTools}>
          <ModeToggle />
          {user ? (
            <button onClick={handleLogout} className={styles.authButton}>
              Logout
            </button>
          ) : (
            <Link href="/login" className={styles.authButton}>
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default BlogHeader;
