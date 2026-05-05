'use client';

import React from 'react';
import Link from 'next/link';
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandGithub,
} from '@tabler/icons-react';
import styles from './Footer.module.css';

type FooterLink = { label: string; href: string };

const mainLinks: FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const workWithMeLinks: FooterLink[] = [
  { label: 'Consulting', href: '/work-with-me/consulting' },
  { label: 'Web Development', href: '/work-with-me/webdev' },
  { label: 'Maths Tutoring', href: '/work-with-me/maths' },
];

const CONTACT_EMAIL = 'angus.hally@gmail.com';

function Footer() {
  const currentYear = new Date().getFullYear();
  const buildInfo = process.env.NEXT_PUBLIC_BUILD_NUMBER;

  return (
    <footer className={styles.footer}>
      <div className={styles.split}>
        <div className={styles.left}>
          <h2 className={styles.headline}>
            Say hello<span className={styles.headlineAccent}>.</span>
            <br />
            The kettle&apos;s on.
          </h2>

          <a href={`mailto:${CONTACT_EMAIL}`} className={styles.mailto}>
            {CONTACT_EMAIL} →
          </a>

          <div className={styles.fineprint}>
            <span>© {currentYear} Angus Hally</span>
            {process.env.NODE_ENV === 'development' ? (
              <span>Development Environment</span>
            ) : buildInfo ? (
              <span>Build: {buildInfo}</span>
            ) : null}
          </div>
        </div>

        <div className={styles.right}>
          <div>
            <h5 className={styles.colHeading}>Main</h5>
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.colLink}>
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <h5 className={styles.colHeading}>Work with me</h5>
            {workWithMeLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.colLink}>
                {link.label}
              </Link>
            ))}
          </div>
          <div>
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
      </div>
    </footer>
  );
}

export default Footer;
