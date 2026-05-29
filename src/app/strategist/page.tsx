'use client';

/**
 * `/strategist` — Data Strategy persona page (v2, editorial "data field").
 *
 * Re-skinned to an ink-on-paper editorial identity with an interactive
 * three.js hero (DataFieldHero): a steel-sphere lattice that resolves from
 * noise into structure. Curated render of docs/cvs/data-strategy-cv.md;
 * several engagements remain anonymised pending confirmation on what's
 * publicly nameable. See docs/guides/persona-page-workflow.md.
 */

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { strategistFontClassNames } from './fonts';
import styles from './strategist.module.css';

const DataFieldHero = dynamic(() => import('./DataFieldHero'), { ssr: false });

const engagements = [
    {
        title: 'FTSE-100 data valuation',
        meta: 'Anmut · 2022–2025',
        body: 'Led engagements helping enterprise clients quantify the financial value of their data estate. Forces a chain from data → decision → revenue/cost impact rather than treating data as a balance-sheet abstraction. Outputs ranged from board-level valuations to asset-level prioritisation feeding platform investment.',
        tags: ['Data valuation', 'C-suite', 'P&L impact'],
    },
    {
        title: 'JLR — client-side data strategy',
        meta: 'Anmut · ~2024',
        body: 'Client-side at Jaguar Land Rover. Reported into senior data leaders on strategy and prioritisation. Attended JLR Data Fest 2024 as part of the engagement.',
        tags: ['Automotive', 'Client-side', 'Strategy'],
    },
    {
        title: 'Grace — data-maturity tool',
        meta: 'Anmut · 2022–2025',
        body: "Contributor on Grace, Anmut's data-maturity diagnostic. Scores an organisation across capability dimensions, produces a maturity baseline + improvement roadmap. Used in initial engagements to scope where the value-creation opportunity actually sits.",
        tags: ['Data maturity', 'Diagnostic', 'Roadmap'],
    },
    {
        title: 'FTSE-100 sector data-value research',
        meta: 'Anmut · 2023–2024',
        body: "Contribution to Anmut's published thinking on data value across sectors. Mapped how data contributes to enterprise value differently in financial services vs. consumer goods vs. industrials vs. healthcare.",
        tags: ['Research', 'Cross-sector', 'Published'],
    },
    {
        title: 'Pricing & GDPR — telecoms + insurance',
        meta: 'Accenture Strategy · 2019–2020',
        body: 'Pricing strategy and GDPR engagements at large telecoms and insurance clients. The analyst-to-strategy transition. Cross-functional work with data, legal, and commercial leaders.',
        tags: ['Pricing', 'GDPR', 'Telecoms', 'Insurance'],
    },
    {
        title: 'Digital transformation — UK public sector',
        meta: 'Accenture · 2018–2019',
        body: 'Digital-transformation programmes across the Royal Navy, the Police, and the Courts & Tribunals Judiciary. Where I cut my teeth understanding how strategy actually contacts operations in legacy estates.',
        tags: ['Public sector', 'Royal Navy', 'Police', 'Courts'],
    },
];

const frameworks = [
    {
        title: 'Data valuation',
        sub: 'Anmut methodology',
        body: 'Data asset taxonomy → use case mapping → value chain → P&L impact. The chain that turns "we have lots of data" into "this dataset is worth £X."',
    },
    {
        title: 'Data maturity',
        sub: 'Multi-dimensional',
        body: 'Capability assessment across data dimensions (governance, architecture, analytics, culture) → baseline → roadmap → prioritised investment.',
    },
    {
        title: 'Pricing strategy',
        sub: 'Value-based + GDPR-aware',
        body: 'Willingness-to-pay analysis, value-based pricing, and the GDPR-constrained question of how to monetise data without inheriting risk.',
    },
];

const reveal: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 0.84, 0.24, 1] } },
};

const StrategistPersonaPage = () => {
    return (
        <div className={`${strategistFontClassNames} ${styles.page}`}>
            {/* ---------- Hero ---------- */}
            <DataFieldHero />

            <div className={styles.body}>
                {/* ---------- Selected engagements ---------- */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={reveal}
                >
                    <div className={styles.sectionHead}>
                        <span className={styles.sectionNum}>01 / engagements</span>
                        <h2 className={styles.sectionTitle}>Selected engagements</h2>
                    </div>
                    <p className={styles.sectionNote}>
                        Several FTSE-100 clients are anonymised pending confirmation on what&rsquo;s
                        publicly nameable. Specific clients on request.
                    </p>
                    <div className={styles.grid}>
                        {engagements.map((e) => (
                            <article key={e.title} className={styles.card}>
                                <div className={styles.cardHead}>
                                    <h3 className={styles.cardTitle}>{e.title}</h3>
                                    <span className={styles.cardMeta}>{e.meta}</span>
                                </div>
                                <p className={styles.cardBody}>{e.body}</p>
                                <div className={styles.tags}>
                                    {e.tags.map((t) => (
                                        <span key={t} className={styles.tag}>{t}</span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </motion.section>

                {/* ---------- Frameworks ---------- */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={reveal}
                >
                    <div className={styles.sectionHead}>
                        <span className={styles.sectionNum}>02 / method</span>
                        <h2 className={styles.sectionTitle}>Frameworks I work in</h2>
                    </div>
                    <div className={styles.fwGrid}>
                        {frameworks.map((f) => (
                            <article key={f.title} className={styles.fwCard}>
                                <span className={styles.fwSub}>{f.sub}</span>
                                <h3 className={styles.fwTitle}>{f.title}</h3>
                                <p className={styles.fwBody}>{f.body}</p>
                            </article>
                        ))}
                    </div>
                </motion.section>

                {/* ---------- Engineering bridge ---------- */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={reveal}
                >
                    <div className={styles.bridge}>
                        <h2 className={styles.bridgeTitle}>
                            Strategy is more durable when the strategist can also stand up the
                            system downstream of it.
                        </h2>
                        <p className={styles.bridgeBody}>
                            Unusually for a strategist, I can read schemas, evaluate platform
                            decisions, and ship the prototype that proves the strategy.
                        </p>
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

export default StrategistPersonaPage;
