'use client';

/**
 * `/ai-pm` — AI Product Manager persona, v2 (client island).
 *
 * Editorial "field notes on AI product" treatment (per the design brief),
 * rendered full-bleed: ClientLayout suppresses the site Header/Footer/Gradient
 * for the `ai-pm` surface, so this page owns its own masthead, nav, and footer.
 *
 * Content is a hybrid: the brief's structure and voice, grounded in real facts
 * — HeyLina (co-founder/COO), Accenture, Anmut, and the Lina Lab evaluation
 * engine (see docs/cvs/ai-product-manager-cv.md). Links, email, and references
 * are real and verifiable, not the brief's placeholders.
 *
 * Shell composition (issue #131 · PRD #123 Phase B):
 *  - Shared chrome kit: PersonaFooter (skinned via --persona-* tokens) and
 *    PersonaThemeToggle, consumed from src/components/persona — NOT reinvented.
 *  - In-page anchor nav to this persona's own sections: Hero / About / Work /
 *    Contact. Contact is a SECTION PLACEHOLDER — the actual form is issue B2
 *    (#132/#133/#134), wired here only as an anchor + empty section.
 *  - Light + dark palette scoped in ai-pm.module.css (see /dev for the
 *    reference impl); the toggle flips the shared Mantine color-scheme.
 *
 * This is a `'use client'` island so the theme toggle's Mantine hooks work; a
 * thin server wrapper (page.tsx) owns the persona metadata export — the
 * documented server-wrapper-over-client-island pattern
 * (docs/guides/persona-page-workflow.md).
 */

import Link from 'next/link';
import { PersonaFooter, PersonaThemeToggle } from '@/components/persona';
import { AiPmContactSection } from './AiPmContactSection';
import { aipmFontVars } from './fonts';
import styles from './ai-pm.module.css';
// Skins the globally-mounted overlays (chat panel C1 / consent UI D1) for the
// ai-pm surface. Plain global CSS keyed off [data-surface='ai-pm'] because
// those overlays mount outside this page's .page subtree (see ai-pm.surface.css).
import './ai-pm.surface.css';

const EMAIL = 'angus.hally@gmail.com';
const LINKEDIN_URL = 'https://www.linkedin.com/in/angus-hally-9ab66a87/';

const AiPmPersonaClient = () => {
    return (
        <div className={`${aipmFontVars} ${styles.page}`} id="top">
            <header className={styles.top}>
                <Link className={styles.brand} href="#top">
                    A. Hally <em>— Field notes on AI product</em>
                </Link>
                {/* In-page anchor nav — this persona's own sections only.
                    Hero / About / Work / Contact (issue #131). No first-class
                    full-site nav: the single route back to the main site lives
                    discreetly in the footer. */}
                <nav className={styles.nav} aria-label="Section navigation">
                    <a href="#top">Hero</a>
                    <a href="#about">About</a>
                    <a href="#work">Work</a>
                    <a href="#contact">Contact</a>
                    <PersonaThemeToggle
                        className={styles.themeToggle}
                        iconSize={18}
                        label="Toggle evening/morning edition"
                    />
                </nav>
            </header>

            <div className={styles.masthead}>
                <span className={styles.l}>
                    <span>Vol. III · Issue 02</span>
                    <span>2026 — Q2</span>
                    <span>Field notes</span>
                </span>
                <span className={styles.r}>/ai-pm</span>
            </div>

            {/* HERO ─────────────────────────── */}
            <section className={styles.hero}>
                <div className={styles.kicker}>— Practice paper · AI product management</div>
                <h1>
                    The <em>unglamorous</em> half of shipping{' '}
                    <span className={styles.drop}>AI products.</span>
                </h1>
                <p className={styles.deck}>
                    A working paper on what AI product management <em>actually</em> looks like
                    when the model is the hard part — clinical advisors, compliance, versioning,
                    app-store ops, pricing — written from inside an emotionally-intelligent AI
                    product that ships weekly.
                </p>
                <div className={styles.byline}>
                    <span>
                        <strong>Author</strong>
                        <br />
                        Angus Hally
                    </span>
                    <span>
                        <strong>Role</strong>
                        <br />
                        Co-founder · COO, HeyLina
                    </span>
                    <span>
                        <strong>Filed</strong>
                        <br />
                        London · 2026.05
                    </span>
                    <span>
                        <strong>Reading</strong>
                        <br />≈ 9 minutes
                    </span>
                </div>
            </section>

            {/* ABOUT / ARTICLE ─────────────────────────── */}
            <article className={styles.article} id="about">
                <p>
                    Every founder I meet with an AI product is convinced their hard part is the
                    model. By the time they have shipped past the demo, they have discovered that
                    the hard part is everything around it — the clinical advisors who decide
                    whether a response is safe, the app-store reviewer who decides whether the
                    screenshot is misleading, the pricing decision that decides whether a number
                    implies a medical claim, and the version pipeline that decides whether last
                    Tuesday&rsquo;s release is better than this Tuesday&rsquo;s. The model is
                    twenty percent of the work and eighty percent of the conversation.
                </p>

                <p>
                    I am the co-founder and COO of <a href="https://heylina.ai">HeyLina</a>, an
                    emotionally intelligent AI mobile product on iOS and Android. I do the eighty
                    percent. My co-founder builds the model and the application; I make sure
                    everything around it — including the company itself — compounds week on week.
                    This page is the working paper on that practice, partly so I remember what I
                    have learned, and partly so people running comparable products can{' '}
                    <em>recognise themselves in it</em> and write to me.
                </p>

                <aside className={styles.figure}>
                    <div className={styles.label}>— Fig. 01 · The four boxes I run</div>
                    <h4>The AI-PM stack at HeyLina</h4>
                    <ul>
                        <li>
                            <strong>Clinical &amp; safety advisors.</strong> Clinical advisor
                            relationships I run directly, adjudicating ambiguous responses against
                            a documented safety posture on a regular cadence.
                        </li>
                        <li>
                            <strong>App-store operations.</strong> Versioned screenshots,
                            response-policy docs, and the dialogue we have with reviewers every
                            release across two app stores.
                        </li>
                        <li>
                            <strong>Compliance &amp; eval trail.</strong> Lina Lab — our
                            prompt-evaluation engine — gives an audit-ready record: LLM-as-judge
                            with full provenance (judge type, model, prompt version, rater id),
                            multi-scope rubrics, version-pinned prompts, and a promotion pipeline.
                        </li>
                        <li>
                            <strong>Pricing &amp; positioning.</strong> The single biggest lever
                            on whether users perceive us as wellness or as medical — the
                            highest-stakes framing decision we make.
                        </li>
                    </ul>
                    <div className={styles.caption}>
                        — Each box has its own cadence, ritual, and document. The model is only one
                        input to any of them.
                    </div>
                </aside>

                <h2>
                    <span className={styles.n}>— § 01</span>The case for an AI-PM role at all
                </h2>

                <p>
                    AI products do not fail because the model is wrong. They fail because the
                    company around the model is not yet built. The PM role I am describing is
                    closer to the early role of a regulatory-affairs lead at a biotech, or a head
                    of operations at a clinical-trials site, than it is to anything in consumer
                    software. It is a job that did not exist three years ago and that almost nobody
                    is writing about in public — partly because the people doing it are too busy
                    doing it.
                </p>

                <p className={styles.pull}>
                    &ldquo;AI products do not fail because the model is wrong. They fail because
                    the company around the model is not yet built.&rdquo;
                </p>

                <p>
                    The discipline I draw on most is not product management as it is taught at
                    FAANGs. It is the operating-cadence work I did at <em>Accenture</em> and the
                    data-valuation work I did at <em>Anmut</em> — both of which are really about
                    turning ambiguous information into a decision a team can act on in a given
                    week. That muscle transfers almost without modification to AI product work,
                    because the modal problem of an AI PM is exactly that: &ldquo;what should we
                    decide on Monday given a model whose behaviour we only partially
                    understand?&rdquo;
                </p>

                <h2>
                    <span className={styles.n}>— § 02</span>What I actually do in a week
                </h2>

                <p>
                    Monday is the pipeline review — last week&rsquo;s release notes, this
                    week&rsquo;s fixture additions, anything the eval harness has flagged. The
                    middle of the week is clinical-safety work and app-store ops: flagged
                    transcripts adjudicated against the rubric, and whatever the
                    regulator-of-the-week has decided to write about. The back half is the
                    long-horizon work — pricing experiments, advisor relationships, and the
                    compliance documents nobody asks for until they suddenly do.
                </p>

                <p>
                    There is no calendar slot for &ldquo;make the product better.&rdquo; The
                    product gets better because the four boxes above each get one degree more
                    rigorous every week. That, and a measurable eval loop underneath it, is the
                    whole game.
                </p>

                <h2>
                    <span className={styles.n}>— § 03</span>Why the eval engine is the credential
                </h2>

                <p>
                    Most AI products are run on vibes; this one isn&rsquo;t. Underneath HeyLina
                    sits <em>Lina Lab</em>, a prompt-evaluation engine I personally architected and
                    ship into — a versioned prompt catalog, a variant-comparison runtime, and a
                    multi-scope eval framework (message, turn, conversation, variant). It exists
                    because the commercial reasoning about iteration velocity required it, not
                    because the engineering taste alone did. The dev work is the credential: I
                    read PRs, write PRs, and ship PRs across mobile, backend, and the eval layer.
                </p>

                <p>
                    I am useful to a team that has <em>shipped an AI product to real users</em> and
                    whose operational machinery has not caught up — that is, if you can feel the
                    four boxes above tugging at you but have not yet named them. I am less useful
                    if you are still trying to find product-market fit; there are people much
                    better than me for that.
                </p>
            </article>

            {/* WORK / RESPONSIBILITIES ─────────────────────────── */}
            <section className={styles.resp} id="work">
                <div className={styles.respInner}>
                    <div className={styles.head}>
                        <div className={styles.l}>— § 04 · Work together</div>
                        <h2>
                            The shape of an AI-PM engagement, <em>itemised.</em>
                        </h2>
                    </div>
                    <div className={styles.grid}>
                        <div className={styles.item}>
                            <div className={styles.id}>i.</div>
                            <h3>
                                Audit the <em>four boxes</em>
                            </h3>
                            <p>
                                Map the existing operating ritual against the four-box model,
                                identify the two that are most under-built, and write a memo with
                                concrete next steps.
                            </p>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.id}>ii.</div>
                            <h3>
                                Install the <em>cadence</em>
                            </h3>
                            <p>
                                Weekly pipeline review, structured advisor session, release-notes
                                discipline. Paired with the existing PM so the muscle transfers.
                            </p>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.id}>iii.</div>
                            <h3>
                                Build the <em>compliance trail</em>
                            </h3>
                            <p>
                                The audit-ready document set: fixture provenance, rubric versions,
                                model-change log, advisor adjudication record. The regulator will
                                eventually ask.
                            </p>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.id}>iv.</div>
                            <h3>
                                Stand up the <em>eval loop</em>
                            </h3>
                            <p>
                                LLM-as-judge with provenance, variant comparison, multi-scope
                                rubrics, and a promotion pipeline — the Lina Lab pattern, adapted
                                to your stack so iteration stops being guesswork.
                            </p>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.id}>v.</div>
                            <h3>
                                Pricing &amp; <em>positioning</em>
                            </h3>
                            <p>
                                An evidence-based working session on the most consequential framing
                                decision of your product, informed by data-valuation work. Plus a
                                written recommendation.
                            </p>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.id}>vi.</div>
                            <h3>Advisor recruitment</h3>
                            <p>
                                Identifying, interviewing, and contracting an initial clinical or
                                domain panel, using a structured interview script.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* REFERENCES ─────────────────────────── */}
            <section className={styles.refs} id="refs">
                <h3>— References &amp; further reading</h3>
                <ol>
                    <li>
                        <span className={styles.n}>i.</span> Hally, A.{' '}
                        <em>Harness engineer — notes on the runtime around the LLM.</em>{' '}
                        <Link href="/harness">/harness</Link>
                    </li>
                    <li>
                        <span className={styles.n}>ii.</span> Hally, A.{' '}
                        <em>Developer — can he ship?</em> <Link href="/dev">/dev</Link>
                    </li>
                    <li>
                        <span className={styles.n}>iii.</span> Hally, A.{' '}
                        <em>Data strategist — data valuation that survives engineering reality.</em>{' '}
                        <Link href="/strategist">/strategist</Link>
                    </li>
                    <li>
                        <span className={styles.n}>iv.</span> Anthropic.{' '}
                        <em>Constitutional AI and the operationalisation of safety.</em>{' '}
                        anthropic.com · 2023.
                    </li>
                    <li>
                        <span className={styles.n}>v.</span> FDA.{' '}
                        <em>
                            Artificial Intelligence/Machine Learning-Based Software as a Medical
                            Device (SaMD) Action Plan.
                        </em>{' '}
                        2021.
                    </li>
                    <li>
                        <span className={styles.n}>vi.</span> <em>HeyLina</em> — emotionally
                        intelligent AI, iOS &amp; Android.{' '}
                        <a href="https://heylina.ai">heylina.ai</a>
                    </li>
                    <li>
                        <span className={styles.n}>vii.</span> Hally, A.{' '}
                        <em>How I got here.</em> <Link href="/about">/about</Link>
                    </li>
                    <li>
                        <span className={styles.n}>viii.</span> BSc Philosophy &amp; Economics,
                        First Class — <em>London School of Economics</em>, 2013–2016.
                    </li>
                </ol>
            </section>

            {/* CONTACT ─────────────────────────────────────────────
                B2 (#134). The interactive contact section: a skinned form wired
                to the shared `useContactForm` hook with source="ai-pm", plus the
                "what I collect" notice linking to /ai-pm/privacy. The form lives
                in AiPmContactSection (it owns the reCAPTCHA + consent wiring);
                here we keep the editorial two-column frame and the email/LinkedIn
                fallback alongside it. The #contact anchor is unchanged from B1. */}
            <section className={styles.corresp} id="contact" aria-label="Contact">
                <div className={styles.correspInner}>
                    <div>
                        <h2>
                            For <em>correspondence</em>
                            <br />
                            or working sessions.
                        </h2>
                        <p className={styles.correspIntro}>
                            I read everything that arrives, and reply within two working days. The
                            most useful thing you can send is a one-page note of where you are
                            stuck.
                        </p>
                        <div className={styles.addr}>
                            Letters &nbsp;·&nbsp; <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                            <br />
                            LinkedIn &nbsp;·&nbsp;{' '}
                            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                                angus-hally
                            </a>
                        </div>
                    </div>
                    <div className={styles.col}>
                        <AiPmContactSection />
                    </div>
                </div>
            </section>

            {/* FOOTER ───────────────────────────────────────────────
                Shared PersonaFooter, skinned for ai-pm via --persona-* tokens
                set on .page (see ai-pm.module.css). Slots: contact, privacy,
                socials, copyright, and the SINGLE discreet main-site link.
                Privacy points at the persona-local /ai-pm/privacy view that B2
                will add; until then it resolves under this surface's chrome. */}
            <PersonaFooter
                className={styles.personaFooter}
                contact={
                    <a className={styles.footerLink} href="#contact">
                        Contact
                    </a>
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
                ariaLabel="ai-pm footer"
            />
        </div>
    );
};

export default AiPmPersonaClient;
