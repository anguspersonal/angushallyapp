'use client';

/**
 * `/ai-pm/privacy` — the AI-PM persona's privacy view (client island).
 *
 * Issue #134 (B2). Renders the SINGLE canonical privacy content
 * (src/lib/legal/privacyPolicy.ts) inside the AI-PM persona's editorial
 * "field notes" chrome. The legal wording is NEVER duplicated: we iterate
 * `PRIVACY_POLICY_SECTIONS` and map each render-agnostic block (paragraph /
 * list) to the broadsheet typography. The persona surface already owns this
 * sub-route — `/ai-pm/*` resolves to the `ai-pm` fullBleed surface in the
 * registry (src/lib/surfaces.ts), so this page renders with no site chrome and
 * supplies its own masthead/footer, exactly like the main /ai-pm page.
 *
 * While `DRAFT` is true we surface `DRAFT_NOTICE` (the renderer's
 * responsibility per the module's contract) so it is unmistakably a draft until
 * the owner completes the placeholders and a human legal review flips DRAFT.
 *
 * A `'use client'` island so the shared Mantine color-scheme toggle works; the
 * thin server wrapper (page.tsx) owns the metadata export — the documented
 * server-wrapper-over-client-island pattern.
 */

import * as React from 'react';
import Link from 'next/link';
import { PersonaFooter, PersonaThemeToggle } from '@/components/persona';
import { ConsentManageLink } from '@/components/consent/ConsentManageLink';
import {
    PRIVACY_POLICY_SECTIONS,
    DRAFT,
    DRAFT_NOTICE,
    type PrivacyBlock,
} from '@/lib/legal/privacyPolicy';
import { aipmFontVars } from '../fonts';
import styles from './privacy.module.css';
// Skins the globally-mounted overlays (chat panel / consent UI) for the ai-pm
// surface on this sub-route too (see src/app/ai-pm/ai-pm.surface.css).
import '../ai-pm.surface.css';

const EMAIL = 'angus.hally@gmail.com';
const LINKEDIN_URL = 'https://www.linkedin.com/in/angus-hally-9ab66a87/';

/** Roman-numeral section markers, in the broadsheet's voice. */
const ROMAN = [
    '§ 01',
    '§ 02',
    '§ 03',
    '§ 04',
    '§ 05',
    '§ 06',
    '§ 07',
    '§ 08',
    '§ 09',
    '§ 10',
];

function Block({ block }: { block: PrivacyBlock }) {
    if (block.type === 'paragraph') {
        return <p>{block.text}</p>;
    }
    return (
        <>
            {block.lead ? <p className={styles.lead}>{block.lead}</p> : null}
            <ul>
                {block.items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </>
    );
}

const AiPmPrivacyClient = () => {
    return (
        <div className={`${aipmFontVars} ${styles.page}`} id="top">
            <header className={styles.top}>
                <Link className={styles.brand} href="/ai-pm">
                    A. Hally <em>— Field notes on AI product</em>
                </Link>
                <nav className={styles.nav} aria-label="Section navigation">
                    <Link href="/ai-pm">Back to notes</Link>
                    <Link href="/ai-pm#contact">Contact</Link>
                    <PersonaThemeToggle
                        className={styles.themeToggle}
                        iconSize={18}
                        label="Toggle evening/morning edition"
                    />
                </nav>
            </header>

            <div className={styles.masthead}>
                <span className={styles.l}>
                    <span>Appendix · Privacy</span>
                    <span>UK GDPR</span>
                </span>
                <span className={styles.r}>/ai-pm/privacy</span>
            </div>

            <div className={styles.head}>
                <div className={styles.kicker}>— Appendix · Data &amp; privacy</div>
                <h1>How your data is handled.</h1>
                <p className={styles.lede}>
                    The same policy that governs the rest of the site, set here in the field-notes
                    edition. If you write to me through the contact form below the article, this is
                    what happens to what you send.
                </p>
            </div>

            {DRAFT ? (
                <div className={styles.draftNotice} role="note">
                    <strong>Draft</strong>
                    {DRAFT_NOTICE}
                </div>
            ) : null}

            <main className={styles.body}>
                {PRIVACY_POLICY_SECTIONS.map((section, idx) => (
                    <section key={section.id} id={section.id} className={styles.section}>
                        <h2>
                            <span className={styles.n}>— {ROMAN[idx] ?? `§ ${idx + 1}`}</span>
                            {section.heading}
                        </h2>
                        {section.body.map((block, i) => (
                            <Block key={i} block={block} />
                        ))}
                        {section.id === 'cookies' ? (
                            <p className={styles.manageRow}>
                                <ConsentManageLink className={styles.manageButton}>
                                    Open cookie preferences
                                </ConsentManageLink>
                            </p>
                        ) : null}
                    </section>
                ))}
            </main>

            <PersonaFooter
                className={styles.personaFooter}
                contact={
                    <Link className={styles.footerLink} href="/ai-pm#contact">
                        Contact
                    </Link>
                }
                privacy={
                    <Link className={styles.footerLink} href="/ai-pm/privacy">
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
                        <a className={styles.footerLink} href={`mailto:${EMAIL}`}>
                            Email
                        </a>
                    </>
                }
                themeToggle={
                    <PersonaThemeToggle
                        className={styles.themeToggle}
                        iconSize={18}
                        label="Toggle evening/morning edition"
                    />
                }
                copyright={<span>© mmxxvi · A. Hally · London</span>}
                mainSiteLink={{ label: 'angushally.com ↗', href: '/' }}
                ariaLabel="ai-pm privacy footer"
            />
        </div>
    );
};

export default AiPmPrivacyClient;
