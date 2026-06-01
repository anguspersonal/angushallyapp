'use client';

/**
 * `/strategist/privacy` — the canonical privacy policy in strategist chrome
 * (PRD #123 · Phase B2 · issue #133, sub-route ownership from #125).
 *
 * The legal text is NEVER duplicated here: this island iterates the single
 * canonical source (`PRIVACY_POLICY_SECTIONS` in src/lib/legal/privacyPolicy.ts,
 * issue #126) and renders it in the persona's editorial "ink-on-paper" voice.
 * While `privacyPolicy.DRAFT` is true it surfaces the canonical `DRAFT_NOTICE`
 * banner so it's unmistakable the wording is pre-legal-review.
 *
 * Chrome reuse: the route renders inside `[data-surface="strategist"]` (the
 * surface registry routes /strategist/* to the persona's fullBleed surface), so
 * the same persona nav + footer + light/dark palette as the index apply. Styles
 * come from the shared strategist.module.css; this page adds only the prose
 * classes for the policy body.
 */

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { PersonaFooter, PersonaThemeToggle } from '@/components/persona';
import {
  PRIVACY_POLICY_SECTIONS,
  DRAFT_NOTICE,
  privacyPolicy,
} from '@/lib/legal/privacyPolicy';
import { ConsentManageLink } from '@/components/consent/ConsentManageLink';
import { strategistFontClassNames } from '../fonts';
import styles from '../strategist.module.css';
import privacyStyles from './privacy.module.css';
// Global persona skin for the cross-tree chat/consent fixed elements (same as
// the index island) — keeps the standalone /strategist/privacy view skinned too.
import '../strategist.surface.css';

const CONTACT_EMAIL = 'angus.hally@gmail.com';
const LINKEDIN_URL = 'https://www.linkedin.com/in/angus-hally-9ab66a87/';
const GITHUB_URL = 'https://github.com/anguspersonal';

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 0.84, 0.24, 1] } },
};

export default function StrategistPrivacyClient() {
  return (
    <div className={`${strategistFontClassNames} ${styles.page}`}>
      {/* ---------- Nav (persona-local, mirrors the index) ---------- */}
      <nav className={styles.navBar} aria-label="Strategist">
        <Link className={styles.brand} href="/strategist">
          <span className={styles.brandGem} />
          AH · <span className={styles.brandDim}>/strategist</span>
        </Link>
        <div className={styles.navLinks}>
          <Link className={styles.navLink} href="/strategist#about">
            <span className={styles.navLinkN}>01</span>About
          </Link>
          <Link className={styles.navLink} href="/strategist#work">
            <span className={styles.navLinkN}>02</span>Work
          </Link>
          <Link className={styles.navLink} href="/strategist#contact">
            <span className={styles.navLinkN}>03</span>Contact
          </Link>
        </div>
        <PersonaThemeToggle className={styles.navToggle} iconSize={18} />
      </nav>

      <div className={styles.body}>
        <motion.div initial="hidden" animate="visible" variants={reveal}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum}>privacy</span>
            <h1 className={styles.sectionTitle}>Privacy policy</h1>
          </div>

          {privacyPolicy.draft ? (
            <p className={privacyStyles.draftNotice} role="note">
              {DRAFT_NOTICE}
            </p>
          ) : null}

          <p className={privacyStyles.intro}>
            How this site handles your data. You can review or change your cookie
            choices any time via{' '}
            <ConsentManageLink>
              <span className={privacyStyles.manageLink}>cookie preferences</span>
            </ConsentManageLink>
            .
          </p>

          <div className={privacyStyles.policy}>
            {PRIVACY_POLICY_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className={privacyStyles.section}>
                <h2 className={privacyStyles.heading}>{section.heading}</h2>
                {section.body.map((block, i) =>
                  block.type === 'paragraph' ? (
                    <p key={i} className={privacyStyles.paragraph}>
                      {block.text}
                    </p>
                  ) : (
                    <div key={i}>
                      {block.lead ? (
                        <p className={privacyStyles.paragraph}>{block.lead}</p>
                      ) : null}
                      <ul className={privacyStyles.list}>
                        {block.items.map((item, j) => (
                          <li key={j} className={privacyStyles.listItem}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                )}
              </section>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ---------- Footer (shared chrome kit, themed for strategist) ---------- */}
      <PersonaFooter
        className={styles.footer}
        ariaLabel="Strategist footer"
        contact={
          <a className={styles.footerLink} href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        }
        privacy={
          <Link className={styles.footerLink} href="/strategist/privacy">
            Privacy
          </Link>
        }
        socials={
          <>
            <a
              className={styles.footerLink}
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              className={styles.footerLink}
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </>
        }
        themeToggle={<PersonaThemeToggle className={styles.footerToggle} iconSize={18} />}
        owner="Angus Hally"
        mainSiteLink={{ label: 'angushally.com ↗', href: '/' }}
      />
    </div>
  );
}
