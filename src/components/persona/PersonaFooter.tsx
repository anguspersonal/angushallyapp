'use client';

import * as React from 'react';
import styles from './PersonaFooter.module.css';

/**
 * Shared utility-row footer for persona pages.
 *
 * This is the ONE shared footer structure that every persona consumes so the
 * three personas don't drift into three divergent footers (PRD #123, story
 * 25). It is deliberately:
 *
 *  - slot-based: each region (contact, privacy, socials, copyright, and the
 *    single discreet main-site link) is a slot the persona fills, so the
 *    structure is shared but the content/wording is delegated;
 *  - visually neutral & tokenized: it ships no persona colours. Skinning is
 *    via CSS custom properties (--persona-footer-* / --persona-ink) and an
 *    optional `className`, so a persona themes it without forking it;
 *  - unopinionated about layout specifics beyond a horizontal utility row that
 *    wraps on small screens.
 *
 * Navigation intent (PRD #123, stories 23/24): personas are standalone, so the
 * footer offers exactly ONE discreet link back to the main site via the
 * `mainSiteLink` slot — not first-class site navigation.
 */

export interface PersonaFooterMainSiteLink {
  /** Visible text for the discreet link back to the main site. */
  label: string;
  /** Destination (defaults to the site root if omitted). */
  href?: string;
}

export interface PersonaFooterProps {
  /** Contact slot — typically a mailto link or an in-page Contact anchor. */
  contact?: React.ReactNode;
  /** Privacy slot — typically a link to the persona's /privacy view. */
  privacy?: React.ReactNode;
  /** Socials slot — typically a row of icon links. */
  socials?: React.ReactNode;
  /** Theme toggle slot — typically a <PersonaThemeToggle />. */
  themeToggle?: React.ReactNode;
  /**
   * Copyright slot. Pass a node to fully control it, or omit and pass
   * `owner` to render a default "© {year} {owner}".
   */
  copyright?: React.ReactNode;
  /** Owner name for the default copyright line when `copyright` is not given. */
  owner?: string;
  /**
   * The single discreet link back to the main site. Personas read as
   * standalone, so this is intentionally the only route out.
   */
  mainSiteLink?: PersonaFooterMainSiteLink;
  /** Extra class merged onto the <footer> for persona skinning. */
  className?: string;
  /** Accessible label for the landmark. Defaults to "Footer". */
  ariaLabel?: string;
}

export function PersonaFooter({
  contact,
  privacy,
  socials,
  themeToggle,
  copyright,
  owner,
  mainSiteLink,
  className,
  ariaLabel = 'Footer',
}: PersonaFooterProps) {
  const year = new Date().getFullYear();

  const copyrightNode =
    copyright ?? (owner ? <span>© {year} {owner}</span> : null);

  return (
    <footer
      className={[styles.footer, className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      <div className={styles.row}>
        <nav className={styles.utility} aria-label="Footer links">
          {contact ? <span className={styles.slot}>{contact}</span> : null}
          {privacy ? <span className={styles.slot}>{privacy}</span> : null}
          {socials ? <span className={styles.socials}>{socials}</span> : null}
          {themeToggle ? <span className={styles.slot}>{themeToggle}</span> : null}
        </nav>

        <div className={styles.meta}>
          {copyrightNode ? <span className={styles.copyright}>{copyrightNode}</span> : null}
          {mainSiteLink ? (
            <a className={styles.mainSiteLink} href={mainSiteLink.href ?? '/'}>
              {mainSiteLink.label}
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export default PersonaFooter;
