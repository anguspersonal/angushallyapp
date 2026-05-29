'use client';

/**
 * `/dev` — Developer persona page.
 *
 * Full-bleed editorial "plasma" surface (site chrome suppressed via the
 * `dev` surface in ClientLayout). Copy is grounded in docs/cvs/dev-cv.md
 * and live metrics from @/data/code-stats.json. The hero is a draggable
 * WebGL plasma blob (three.js + custom GLSL).
 * See docs/guides/persona-page-workflow.md.
 */

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './dev.module.css';
import statsData from '@/data/code-stats.json';

// three.js is heavy — code-split it out of the route's initial bundle and
// the server render. The hero text below stays server-rendered; only the
// WebGL canvas mounts client-side after hydration.
const PlasmaHero = dynamic(() => import('./PlasmaHero'), { ssr: false });

const CONTACT_EMAIL = 'angus.hally@gmail.com';
const GITHUB_URL = 'https://github.com/anguspersonal';
const LINKEDIN_URL = 'https://www.linkedin.com/in/angus-hally-9ab66a87/';

const formatCompact = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
    return `${n}`;
};

const tickerItems = [
    'react 19',
    'next.js 15 · app router',
    'typescript · strict',
    'react native · expo',
    'firebase functions v2',
    'fastapi + pydantic',
    'postgres + knex',
    'supabase',
    'pinecone · vector',
    'openai sdk',
    '@anthropic-ai/sdk',
    'llamaindex',
    'framer motion',
    'vitest · detox',
];

interface ShipItem {
    year: string;
    name: string;
    desc: string;
    stack: string;
    href?: string;
}

const shipping: ShipItem[] = [
    {
        year: '2025 · ongoing',
        name: 'HeyLina',
        desc: 'Customer-facing AI product. Expo / React Native app, Firebase Functions v2 backend, internal React + Vite ops console. RAG chat with user-scoped Pinecone indexes.',
        stack: 'expo · functions · pinecone',
    },
    {
        year: '2025 · ongoing',
        name: 'Lina Lab',
        desc: 'Prompt-evaluation engine behind HeyLina. Versioned prompt catalog, LLM-as-judge with full provenance, multi-scope eval framework.',
        stack: 'fastapi · supabase · openai',
        href: 'https://lina-lab-production.up.railway.app',
    },
    {
        year: '2025 · ongoing',
        name: 'AHKMS',
        desc: 'Multi-platform knowledge-management system (PARAMPS). Turborepo: Next.js web, Express worker, Expo mobile, shared contracts. Capture → AI extraction → human-in-the-loop review.',
        stack: 'next · express · supabase',
        href: 'https://kms.angushally.com',
    },
    {
        year: '2023 →',
        name: 'angushallyapp',
        desc: 'This site. Next.js 15 / React 19 with Node / Express + PostgreSQL. Habit tracker, Strava sync, UK FSA hygiene lookup, blog, @anthropic-ai/sdk chat.',
        stack: 'next · postgres · mantine',
        href: 'https://angushally.com',
    },
    {
        year: '2025',
        name: 'Nexus',
        desc: 'Chat-first personal workspace over a structured knowledge graph. React + Vite + Tailwind on the front, Firebase underneath.',
        stack: 'react · firebase',
    },
];

interface Capability {
    num: string;
    accent: string;
    title: string;
    desc: string;
    tags: string[];
}

const capabilities: Capability[] = [
    {
        num: '01',
        accent: 'var(--plasma-1)',
        title: 'Full-stack product',
        desc: 'React 19 / Next.js 15 App Router on the front to Node / Express + Postgres on the back. Auth, RBAC, the whole vertical.',
        tags: ['next', 'react', 'node'],
    },
    {
        num: '02',
        accent: 'var(--plasma-2)',
        title: 'Mobile',
        desc: 'React Native (Expo / Expo Router), EAS builds, Detox E2E. Shipping HeyLina’s customer app alongside our mobile engineer.',
        tags: ['expo', 'rn', 'eas'],
    },
    {
        num: '03',
        accent: 'var(--plasma-3)',
        title: 'AI / LLM systems',
        desc: 'RAG with user-scoped vector indexes, tool-use, structured outputs, prompt config served live. UX that respects latency and uncertainty.',
        tags: ['openai', 'anthropic', 'rag'],
    },
    {
        num: '04',
        accent: 'var(--plasma-4)',
        title: 'Eval & harness',
        desc: 'Versioned prompt catalogs, LLM-as-judge with full provenance, multi-scope rubrics, promotion pipelines. The Lina Lab discipline.',
        tags: ['fastapi', 'evals', 'provenance'],
    },
    {
        num: '05',
        accent: 'var(--plasma-1)',
        title: 'Backend & data',
        desc: 'Postgres + Knex migrations, Supabase, Firestore, Pinecone. Typed schemas, MECE taxonomies, lifecycle state machines, soft-delete + version pinning.',
        tags: ['postgres', 'supabase', 'pinecone'],
    },
    {
        num: '06',
        accent: 'var(--plasma-2)',
        title: 'Polish & ops',
        desc: 'Framer Motion, CI/CD on GitHub Actions, Husky + lint-staged gates, Puppeteer rendering, PWA. The last 5% that survives a Lighthouse run.',
        tags: ['framer', 'ci', 'husky'],
    },
];

const DevPersonaPage = () => {
    const fpsRef = React.useRef<HTMLSpanElement>(null);
    const msRef = React.useRef<HTMLSpanElement>(null);

    const lines = formatCompact(statsData.headline.totalLinesAdded);
    const commits = statsData.headline.totalCommits.toLocaleString('en-GB');
    const repos = statsData.headline.reposContributedTo;
    const activeDays = statsData.activity.totalActiveDays;

    return (
        <div className={styles.page}>
            <div className={styles.noise} />
            <div className={styles.scanline} />
            <div className={styles.railL} />
            <div className={styles.railR} />

            {/* ── nav ── */}
            <nav className={styles.navBar}>
                <Link className={styles.brand} href="/">
                    <span className={styles.gem} />
                    AHALLY · <span className={styles.brandDim}>/dev</span>
                </Link>
                <div className={styles.navLinks}>
                    <a className={styles.navLink} href="#shipping">
                        <span className={styles.navLinkN}>01</span>shipping
                    </a>
                    <a className={styles.navLink} href="#stack">
                        <span className={styles.navLinkN}>02</span>stack
                    </a>
                    <a className={styles.navLink} href="#contact">
                        <span className={styles.navLinkN}>03</span>contact
                    </a>
                </div>
                <Link className={styles.back} href="/personas">
                    ← all personas
                </Link>
            </nav>

            {/* ── hero ── */}
            <section className={styles.hero} id="top">
                <div className={styles.heroGrid} />
                <div className={styles.wash1} />
                <div className={styles.wash2} />
                <PlasmaHero fpsRef={fpsRef} msRef={msRef} />

                <div className={`${styles.corner} ${styles.cornerTl}`} />
                <div className={`${styles.corner} ${styles.cornerTr}`} />
                <div className={`${styles.corner} ${styles.cornerBl}`} />
                <div className={`${styles.corner} ${styles.cornerBr}`} />

                <div className={styles.overlay}>
                    <div className={styles.overlayRow}>
                        <span className={styles.eyebrow}>co-founder &amp; coo · ships code · london</span>
                        <div className={styles.telemetry}>
                            <span>
                                fps <span className={styles.telemetryV} ref={fpsRef}>60</span>
                            </span>
                            <span>
                                ms <span className={styles.telemetryV} ref={msRef}>14</span>
                            </span>
                            <span className={styles.telemetryOk}>● online</span>
                        </div>
                    </div>

                    <div>
                        <h1 className={styles.headline}>
                            Builder with a <span className={styles.glow}>strategist&rsquo;s instincts</span>
                            <br />
                            <span className={styles.dim}>&amp; an operator&rsquo;s</span>
                            <br />
                            <span className={styles.dim}>discipline.</span>
                        </h1>
                        <p className={styles.lede}>
                            Angus Hally — co-founder &amp; COO at HeyLina, and I ship the code. Over the last two
                            years I&rsquo;ve built the <em>Python evaluation engine</em> behind HeyLina&rsquo;s prompt
                            iteration, a multi-platform AI knowledge-management system, and this site. A decade of data
                            strategy before that — but every system here has my fingerprints on the code, not just the
                            spec.
                        </p>
                        <div className={styles.ctaRow}>
                            <a className={`${styles.btn} ${styles.btnPrimary}`} href={`mailto:${CONTACT_EMAIL}`}>
                                get in touch ↗
                            </a>
                            <a className={styles.btn} href="#shipping">
                                <span className={styles.dot} /> see what&rsquo;s shipping
                            </a>
                        </div>
                    </div>

                    <div className={styles.overlayRowEnd}>
                        <span className={styles.scrollCue}>
                            <span className={styles.track} />
                            <span className={styles.scrollLabel}>scroll · ▼</span>
                        </span>
                        <span className={styles.dragNote}>
                            drag the form to spin it
                            <br />↕ ↔
                        </span>
                    </div>
                </div>
            </section>

            {/* ── ticker ── */}
            <div className={styles.ticker}>
                <div className={styles.strip}>
                    {[0, 1, 2].map((copy) =>
                        tickerItems.map((item) => <span key={`${copy}-${item}`}>{item}</span>),
                    )}
                </div>
            </div>

            {/* ── shipping ── */}
            <section className={`${styles.block} ${styles.shipping}`} id="shipping">
                <div className={styles.container}>
                    <div className={styles.secHead}>
                        <div>
                            <div className={styles.secId}>§ 01</div>
                            <div className={styles.secEye}>— shipping</div>
                        </div>
                        <h2 className={styles.secTitle}>
                            built &amp; running.
                            <br />
                            not pitched.
                        </h2>
                        <div className={styles.secNote}>
                            A sample from the last two years — some HeyLina (where I&rsquo;m co-founder), the rest
                            personal tooling that outlived the prototype.{' '}
                            <strong>
                                ~{lines} lines across {repos} repos in {commits} commits
                            </strong>
                            , {activeDays} active days. Computed locally via <code>git log --numstat</code>.
                        </div>
                    </div>

                    <ul className={styles.shipList}>
                        {shipping.map((p) => {
                            const inner = (
                                <>
                                    <span className={styles.yr}>{p.year}</span>
                                    <span className={styles.shipName}>{p.name}</span>
                                    <span className={styles.shipDesc}>{p.desc}</span>
                                    <span className={styles.shipStack}>{p.stack}</span>
                                    <span className={styles.arr}>↗</span>
                                </>
                            );
                            return (
                                <li className={styles.shipItem} key={p.name}>
                                    {p.href ? (
                                        <a
                                            className={styles.shipLink}
                                            href={p.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {inner}
                                        </a>
                                    ) : (
                                        inner
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            {/* ── what i pick up ── */}
            <section className={styles.block} id="stack">
                <div className={styles.container}>
                    <div className={styles.secHead}>
                        <div>
                            <div className={styles.secId}>§ 02</div>
                            <div className={styles.secEye}>— what i pick up</div>
                        </div>
                        <h2 className={styles.secTitle}>
                            six things,
                            <br />
                            done deep.
                        </h2>
                        <div className={styles.secNote}>
                            Grouped by evidence in the codebases above — not buzzwords. If your project is one of these,
                            I can probably help.
                        </div>
                    </div>

                    <div className={styles.cards}>
                        {capabilities.map((c) => (
                            <div
                                className={styles.card}
                                key={c.num}
                                style={{ ['--accent' as string]: c.accent } as React.CSSProperties}
                            >
                                <div className={styles.cardRow}>
                                    <span className={styles.cardNum}>{c.num}</span>
                                    <span className={styles.cardDot}>●</span>
                                </div>
                                <h3 className={styles.cardTitle}>{c.title}</h3>
                                <p className={styles.cardDesc}>{c.desc}</p>
                                <div className={styles.tags}>
                                    {c.tags.map((t) => (
                                        <span className={styles.tag} key={t}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className={styles.ctaSection} id="contact">
                <div className={styles.container}>
                    <span className={styles.eyebrow}>focused on heylina · occasional engagements · london</span>
                    <h2 className={styles.ctaTitle}>
                        want to build
                        <br />
                        <span className={styles.glow}>something</span>?
                    </h2>
                    <p className={styles.ctaText}>
                        I&rsquo;m focused on HeyLina, but I take on occasional engagements for people in my network and
                        selected clients. Send a paragraph — I&rsquo;ll reply.
                    </p>
                    <div className={styles.ctaButtons}>
                        <a className={`${styles.btn} ${styles.btnPrimary}`} href={`mailto:${CONTACT_EMAIL}`}>
                            {CONTACT_EMAIL} ↗
                        </a>
                        <Link className={styles.btn} href="/contact">
                            contact form ↗
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── footer ── */}
            <footer className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.footerGrid}>
                        <div>
                            <div className={styles.footerBrand}>
                                <span className={styles.footerGemSm} />
                                <strong>AHALLY · /dev</strong>
                            </div>
                            <p className={styles.footerBlurb}>
                                Co-founder of HeyLina. Available for select build work alongside that. London.
                            </p>
                            <p className={styles.footerShipping}>● currently shipping</p>
                        </div>
                        <div>
                            <h4 className={styles.footerH4}>practice</h4>
                            <a className={styles.footerLink} href="#stack">
                                full-stack
                            </a>
                            <a className={styles.footerLink} href="#stack">
                                mobile
                            </a>
                            <a className={styles.footerLink} href="#stack">
                                ai / llm
                            </a>
                            <a className={styles.footerLink} href="#stack">
                                backend
                            </a>
                        </div>
                        <div>
                            <h4 className={styles.footerH4}>tools</h4>
                            <Link className={styles.footerLink} href="/projects">
                                habit tracker
                            </Link>
                            <Link className={styles.footerLink} href="/projects">
                                fsa lookup
                            </Link>
                            <Link className={styles.footerLink} href="/projects">
                                strava sync
                            </Link>
                        </div>
                        <div>
                            <h4 className={styles.footerH4}>contact</h4>
                            <a className={styles.footerLink} href={`mailto:${CONTACT_EMAIL}`}>
                                {CONTACT_EMAIL}
                            </a>
                            <a className={styles.footerLink} href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                                github
                            </a>
                            <a
                                className={styles.footerLink}
                                href={LINKEDIN_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                linkedin
                            </a>
                            <Link className={styles.footerLink} href="/contact">
                                contact form
                            </Link>
                        </div>
                    </div>
                    <div className={styles.footerStrip}>
                        <span>© mmxxvi · angus hally</span>
                        <Link href="/personas">← back to all personas</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DevPersonaPage;
