'use client';

/**
 * `/teacher` — Maths Teacher persona page (v2).
 *
 * Bespoke chalkboard / 3blue1brown-ish design (own top-nav + footer, full-bleed
 * via the "teacher" surface in ClientLayout). Content is the honest TeachFirst /
 * Burnt Mill narrative from docs/cvs/maths-teacher-cv.md reskinned into the new
 * visual system — no aspirational claims (no video series, cohort, or paid
 * workshops). The exam-result evidence gap is surfaced candidly. See
 * docs/guides/persona-page-workflow.md.
 */

import React from 'react';
import Link from 'next/link';
import styles from './teacher.module.css';
import { teacherFontClassNames } from './fonts';

/** Transferable skills — the "what teaching taught me" narrative. */
const lessons = [
    {
        tag: 'briefing skill',
        title: <>The gap between <em>your model</em> and theirs</>,
        body: "Knowing where your understanding of a topic differs from the student's — and reasoning across that gap — is the same skill that lets me brief engineers as a non-engineer and investors as a non-investor.",
        bg: 'var(--accent)',
        svg: (
            <svg viewBox="0 0 320 180" preserveAspectRatio="none">
                <circle cx="80" cy="100" r="40" fill="rgba(255,255,255,.18)" />
                <circle cx="180" cy="80" r="56" fill="rgba(255,255,255,.32)" />
                <circle cx="250" cy="120" r="28" fill="rgba(255,255,255,.5)" />
            </svg>
        ),
    },
    {
        tag: 'performance discipline',
        title: <>Composure under <em>low-status</em> conditions</>,
        body: 'Holding a Year 10 bottom set on a Friday afternoon is a particular kind of performance discipline. Everything since has had a lower difficulty floor.',
        bg: 'var(--accent-3)',
        svg: (
            <svg viewBox="0 0 320 180" preserveAspectRatio="none">
                <rect x="20" y="20" width="80" height="140" fill="rgba(255,255,255,.2)" />
                <rect x="120" y="60" width="80" height="100" fill="rgba(255,255,255,.4)" />
                <rect x="220" y="100" width="80" height="60" fill="rgba(255,255,255,.6)" />
            </svg>
        ),
    },
    {
        tag: 'operating system',
        title: <>Routine as a <em>force multiplier</em></>,
        body: 'Lesson structure — do-now, modelling, independent practice, plenary — is what makes a classroom function. The same shape underwrites a startup operating system, a code-review process, a meeting agenda.',
        bg: 'var(--accent-4)',
        svg: (
            <svg viewBox="0 0 320 180" preserveAspectRatio="none">
                <path d="M 10 160 C 80 120, 160 160, 240 60 S 310 30, 310 30" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="6" />
                <path d="M 10 160 C 80 150, 160 140, 240 110 S 310 100, 310 100" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="4" />
            </svg>
        ),
    },
    {
        tag: 'operator stamina',
        title: <>Marking <em>31 books</em> at midnight</>,
        body: 'Operator stamina starts here. So does the willingness to do the unglamorous part of the job rather than perform around it.',
        bg: 'var(--accent-5)',
        svg: (
            <svg viewBox="0 0 320 180" preserveAspectRatio="none">
                <path d="M 30 160 L 80 60 L 160 130 L 230 30 L 290 110" fill="none" stroke="rgba(31,34,51,.8)" strokeWidth="4" />
                <circle cx="80" cy="60" r="6" fill="rgba(31,34,51,.9)" />
                <circle cx="230" cy="30" r="6" fill="rgba(31,34,51,.9)" />
            </svg>
        ),
    },
];

/** Pedagogical principles — "how I'd teach now". */
const principles = [
    {
        glyph: 'var(--accent)',
        title: <>Diagnostic <em>first.</em></>,
        body: "Find the misconception, then teach the correction. Don't re-teach what's already known.",
    },
    {
        glyph: 'var(--accent-3)',
        title: <>Show, then <em>name.</em></>,
        body: 'Worked examples beat explanation; modelling out loud beats both. The diagram earns the words.',
    },
    {
        glyph: 'var(--accent-2)',
        title: <>Retrieve, don't <em>re-expose.</em></>,
        body: 'Spaced retrieval over re-reading. The effort of recall is where the learning actually happens.',
    },
    {
        glyph: 'var(--accent-4)',
        title: <>Test in the <em>wild.</em></>,
        body: 'A student who can apply a concept in a non-routine context has really got it. Routine practice flatters everyone.',
    },
    {
        glyph: 'var(--accent-5)',
        title: <>Safe to be <em>wrong.</em></>,
        body: 'The biggest determinant of A-Level outcomes is whether a student will be wrong in front of you. Build that before technique.',
    },
];

/** Honest audiences for the page — not paid-workshop pitches. */
const audiences = [
    {
        who: '— School leadership',
        title: <>Heads & SLT weighing a <em>TeachFirst-trained</em> operator</>,
        body: 'Two years of GCSE foundation and higher tier plus A-Level maths in a mixed-intake comprehensive, PGCE completed alongside the placement.',
    },
    {
        who: '— TeachFirst network',
        title: <>Fellow <em>ambassadors</em> and the programme</>,
        body: "Burnt Mill Academy, Harlow, 2016–2018, is the throughline — the placement that the rest of the operating career is built on.",
    },
    {
        who: '— Edtech ventures',
        title: <>Founders building <em>for the classroom</em></>,
        body: 'Someone who has actually marked the books and held the room, not just modelled the market — useful when the product has to survive contact with a real lesson.',
    },
    {
        who: '— 1:1 tutoring',
        title: <>Students & parents after <em>maths support</em></>,
        body: 'GCSE or A-Level maths help from someone who taught both tiers, diagnostic-first and patient with the gap between confidence and competence.',
    },
];

const TeacherPersonaPage = () => {
    return (
        <div className={`${styles.page} ${teacherFontClassNames}`} id="top">
            {/* ── TOP ── */}
            <header className={styles.top}>
                <Link className={styles.brand} href="/">
                    <span className={styles.brandDot}>a</span>
                    Hally <span className={styles.brandSuffix}>— teaching</span>
                </Link>
                <nav className={styles.nav}>
                    <a href="#taught">What it taught me</a>
                    <a href="#pedagogy">Pedagogy</a>
                    <a href="#for">Who it&rsquo;s for</a>
                    <a href="#contact">Get in touch</a>
                </nav>
                <Link className={styles.back} href="/personas">All personas →</Link>
            </header>

            {/* ── HERO ── */}
            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <div>
                        <h1 className={styles.heroTitle}>
                            Hello<span className={styles.wave}>👋</span><br />
                            I&rsquo;m Angus.<br />
                            I make <em>hard ideas</em> feel obvious.
                        </h1>
                        <p className={styles.lede}>
                            I came up <em>through the classroom</em> before I built products — a
                            GCSE and A-Level maths teacher at Burnt Mill Academy in Harlow, on a
                            TeachFirst placement from 2016 to 2018. <em>The hardest thing I&rsquo;ve done,</em>{' '}
                            and where I learned to operate. The teaching muscle never left.
                        </p>
                        <div className={styles.chips}>
                            <span className={`${styles.chip} ${styles.chipLead}`}><span className={styles.dot} /> Two years in the classroom</span>
                            <span className={styles.chip}>GCSE + A-Level maths</span>
                            <span className={styles.chip}>TeachFirst · 2016–2018</span>
                        </div>
                    </div>

                    <div className={styles.blackboard} aria-hidden="true">
                        <div className={styles.bbEq}>
                            <span className="num">P</span><span className="op">(</span><span className="var">understanding</span><span className="op">)</span><br />
                            <span className="op">=</span>
                            <span className="num">f</span><span className="op">(</span><span className="var">diagnosis</span><span className="op">,</span> <span className="var">pacing</span><span className="op">)</span>
                            <span className="op">+</span> <span className="ans">ε</span>
                        </div>
                        <div className={styles.bbPlot}>
                            <svg viewBox="0 0 200 100" preserveAspectRatio="none">
                                <path className="p1" d="M 2 88 C 30 70, 60 88, 90 50 S 150 12, 198 18" />
                                <path className="p2" d="M 2 92 C 40 84, 80 60, 130 56 S 180 38, 198 26" />
                            </svg>
                        </div>
                        <div className={styles.bbLabels}>
                            <span>practice →</span>
                            <span>← understanding</span>
                        </div>
                        <span className={styles.bbTag}>mind the gap</span>
                    </div>
                </div>
            </section>

            {/* ── WHAT TEACHING TAUGHT ME ── */}
            <section className={styles.lessons} id="taught">
                <div className={styles.sectionEye}>— What teaching taught me</div>
                <h2 className={styles.h2}>The skills that <em>outlasted</em> the classroom.</h2>
                <p className={styles.deck}>
                    Why this CV is also relevant to anyone hiring an operator who has held a
                    room. Two years, one placement, the hardest job I&rsquo;ve had — here&rsquo;s what transferred.
                </p>

                <div className={styles.series}>
                    {lessons.map((l, i) => (
                        <article className={styles.lesson} key={i}>
                            <div className={styles.thumb} style={{ background: l.bg }}>
                                {l.svg}
                                <span className={styles.thumbTag}>{l.tag}</span>
                            </div>
                            <h3>{l.title}</h3>
                            <p>{l.body}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* ── PEDAGOGY ── */}
            <section className={styles.why} id="pedagogy">
                <div className={styles.whyInner}>
                    <div>
                        <div className={styles.sectionEye}>— Pedagogy</div>
                        <h2 className={styles.h2}>Five principles I&rsquo;d <em>still</em> teach by.</h2>
                        <p className={styles.whyLede}>
                            Two years in front of GCSE and A-Level classes taught me the
                            difference between a lesson that <em>lands</em> and one that&rsquo;s forgotten by
                            Monday. These are the principles I&rsquo;d bring to any room now — a
                            classroom, a code review, an investor update.
                        </p>
                    </div>
                    <div className={styles.reasons}>
                        {principles.map((p, i) => (
                            <div className={styles.reason} key={i}>
                                <span className={styles.glyph} style={{ background: p.glyph }}>
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <div>
                                    <h4>{p.title}</h4>
                                    <p>{p.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOR WHOM ── */}
            <section className={styles.for} id="for">
                <div className={styles.sectionEye}>— Who this is for</div>
                <h2 className={styles.h2}>Four rooms this <em>speaks to.</em></h2>

                <div className={styles.forGrid}>
                    {audiences.map((a, i) => (
                        <div className={styles.audience} key={i}>
                            <div className={styles.who}>{a.who}</div>
                            <h3>{a.title}</h3>
                            <p>{a.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── HONEST NOTE ── */}
            <section className={styles.note}>
                <div className={styles.noteCard}>
                    <span className={styles.mark}>*</span>
                    <p>
                        <strong>Straight talk:</strong> this page leads with the narrative, not the
                        numbers. Class-level exam-result deltas, observation feedback, and progress
                        data are still in my TeachFirst archive — once I surface them, they lead. I&rsquo;d
                        rather flag the gap than paper over it.
                    </p>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className={styles.cta} id="contact">
                <div className={styles.sectionEye}>— Get in touch</div>
                <h2 className={styles.h2}>Want to <em>talk teaching?</em></h2>
                <p>
                    A school role, an edtech problem, GCSE or A-Level tutoring, or just comparing
                    notes on pedagogy — the teaching never really stopped, and I&rsquo;d love to hear from you.
                </p>
                <Link className={styles.btn} href="/contact">
                    <span>Start a conversation</span>
                    <span className={styles.btnArr}>→</span>
                </Link>
            </section>

            {/* ── FOOTER ── */}
            <footer className={styles.footer}>
                <span>© mmxxvi · angus hally · london</span>
                <span><Link href="/personas">← all personas</Link></span>
            </footer>
        </div>
    );
};

export default TeacherPersonaPage;
