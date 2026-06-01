'use client';

/**
 * `/teacher/privacy` — the canonical privacy policy rendered in the teacher
 * persona's chalkboard chrome (issue B2 / #132).
 *
 * The legal TEXT is the single canonical source in
 * `src/lib/legal/privacyPolicy.ts` — this component only *renders* it (headings,
 * paragraphs, bullet lists) inside the teacher's own top nav + footer, reusing
 * the same `teacher.module.css` palette/tokens as the persona index so the two
 * pages read as one surface. While the policy is in draft (`privacyPolicy.draft`
 * / the `DRAFT` flag) we surface the `DRAFT_NOTICE` banner verbatim. We do NOT
 * flip the DRAFT flag here — that is the
 * owner's call after legal review (HITL, #126).
 *
 * The cookie preference centre is re-openable from this page via the shared
 * ConsentManageLink, matching the policy's "you can change your choice any time"
 * promise.
 */

import * as React from 'react';
import Link from 'next/link';
import { PersonaFooter, PersonaThemeToggle } from '@/components/persona';
import { ConsentManageLink } from '@/components/consent/ConsentManageLink';
import {
  PRIVACY_POLICY_SECTIONS,
  DRAFT_NOTICE,
  privacyPolicy,
} from '@/lib/legal/privacyPolicy';
import styles from '../teacher.module.css';
import '../teacher.surface.css';
import privacyStyles from './privacy.module.css';
import { teacherFontClassNames } from '../fonts';

export function TeacherPrivacyClient() {
  return (
    <div className={`${styles.page} ${teacherFontClassNames}`} id="top">
      {/* ── TOP — same brand + theme toggle as the persona index; the in-page
          anchor nav links back to the index sections so the sub-page still
          reads as part of the one surface. ── */}
      <header className={styles.top}>
        <Link className={styles.brand} href="/teacher#top">
          <span className={styles.brandDot}>a</span>
          Hally <span className={styles.brandSuffix}>— teaching</span>
        </Link>
        <nav className={styles.nav} aria-label="Sections">
          <Link href="/teacher#about">About</Link>
          <Link href="/teacher#pedagogy">Pedagogy</Link>
          <Link href="/teacher#for">Who it&rsquo;s for</Link>
          <Link href="/teacher#contact">Contact</Link>
        </nav>
        <PersonaThemeToggle
          className={styles.themeToggle}
          label="Toggle chalkboard (night) / notebook (day)"
        />
      </header>

      <main className={privacyStyles.wrap}>
        <div className={styles.sectionEye}>— Privacy</div>
        <h1 className={privacyStyles.title}>
          How your <em>data</em> is handled.
        </h1>

        {privacyPolicy.draft ? (
          <p className={privacyStyles.draftNotice} role="note">
            {DRAFT_NOTICE}
          </p>
        ) : null}

        <p className={privacyStyles.lede}>
          This is the same privacy notice that applies across the site, shown
          here in the teaching chrome. You can change which cookies you allow at
          any time:{' '}
          <ConsentManageLink className={privacyStyles.manageLink}>
            open cookie preferences
          </ConsentManageLink>
          .
        </p>

        <div className={privacyStyles.sections}>
          {PRIVACY_POLICY_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className={privacyStyles.section}>
              <h2 className={privacyStyles.h2}>{section.heading}</h2>
              {section.body.map((block, i) =>
                block.type === 'paragraph' ? (
                  <p key={i} className={privacyStyles.paragraph}>
                    {block.text}
                  </p>
                ) : (
                  <div key={i} className={privacyStyles.listBlock}>
                    {block.lead ? <p className={privacyStyles.paragraph}>{block.lead}</p> : null}
                    <ul className={privacyStyles.list}>
                      {block.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </section>
          ))}
        </div>
      </main>

      <PersonaFooter
        className={styles.footer}
        owner="Angus Hally"
        contact={<Link href="/teacher#contact">Get in touch</Link>}
        privacy={<Link href="/teacher/privacy">Privacy</Link>}
        socials={
          <a href="https://www.linkedin.com/in/angushally/" target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
        }
        mainSiteLink={{ label: 'angushally.com ↗', href: '/' }}
      />
    </div>
  );
}

export default TeacherPrivacyClient;
