/* ============================================================================
 * ⚠️  DRAFT — NOT YET LEGALLY REVIEWED  ⚠️
 * ----------------------------------------------------------------------------
 * This is the SINGLE CANONICAL SOURCE of the site's privacy-policy text
 * (issue #126, PRD #123 · Phase A foundation · Type: HITL — human legal
 * review required). The per-persona privacy pages (#128 / "B2") render this
 * same structured content inside each persona's chrome; the legal text is
 * NEVER duplicated as three separate texts.
 *
 * Before this is published (before dev -> main):
 *   1. A human must legally review the wording (HITL acceptance criterion).
 *   2. Every bracketed [PLACEHOLDER] below MUST be completed by the owner.
 *      They are written as literal `[UPPER_SNAKE]` tokens so they are
 *      greppable:  rg "\[[A-Z_]+\]" src/lib/legal/privacyPolicy.ts
 *
 *   Owner-unknowns to fill in (see PRIVACY_POLICY_PLACEHOLDERS):
 *     [PRIVACY_CONTACT_EMAIL]  — email for data-subject requests
 *     [LEGAL_ENTITY]           — registered entity / trading name (or "none")
 *     [POSTHOG_REGION]         — PostHog hosting region (EU / US Cloud)
 *     [EMAIL_PROVIDER]         — provider that delivers contact emails
 *     [LEAD_RETENTION_PERIOD]  — how long contact submissions / leads are kept
 *     [DATE_TBD]               — the "Last updated" date (do NOT invent one)
 *
 * Do NOT hardcode any persona styling here — this module is pure, structured
 * data. Rendering (chrome, fonts, colours, links) is the renderer's job.
 *
 * ADR 0035 note: ADR 0035 protects THIRD-PARTY personal names. The owner,
 * Angus Hally, as the data controller, is permitted to be named here. No other
 * individual is named.
 * ========================================================================== */

/**
 * Whether this policy is still a draft awaiting human legal review.
 *
 * MUST be flipped to `false` (and every placeholder filled) before the content
 * is allowed to ship to production (dev -> main). Renderers can read this flag
 * to show a "DRAFT — not yet legally reviewed" banner.
 */
export const DRAFT = true as const;

/**
 * The "Last updated" value rendered in the Changes section.
 *
 * Left as a literal placeholder on purpose — the owner sets the real date when
 * the policy is reviewed and published. Do NOT invent a date.
 */
export const lastUpdated = '[DATE_TBD]' as const;

/**
 * A single privacy-policy section. Pure, render-agnostic structured data: the
 * renderer decides headings/typography/links per persona chrome.
 *
 * `body` is an ordered list of blocks so a renderer can map paragraphs and
 * bullet lists to whatever components a given chrome uses, without parsing.
 */
export interface PrivacyParagraph {
  type: 'paragraph';
  text: string;
}

export interface PrivacyList {
  type: 'list';
  /** Optional lead-in line shown above the bullets. */
  lead?: string;
  items: string[];
}

export type PrivacyBlock = PrivacyParagraph | PrivacyList;

export interface PrivacySection {
  /** Stable id for anchors / keys; not user-facing styling. */
  id: string;
  heading: string;
  body: PrivacyBlock[];
}

/** The visible draft notice a renderer SHOULD show while {@link DRAFT} is true. */
export const DRAFT_NOTICE =
  'DRAFT — not yet legally reviewed. Bracketed [PLACEHOLDERS] must be completed ' +
  'by the owner before this is published (before dev -> main).';

/**
 * The bracketed owner-unknowns, surfaced as data so tooling (and the PR/owner
 * checklist) can enumerate exactly what must be filled before publishing.
 */
export const PRIVACY_POLICY_PLACEHOLDERS = [
  '[PRIVACY_CONTACT_EMAIL]',
  '[LEGAL_ENTITY]',
  '[POSTHOG_REGION]',
  '[EMAIL_PROVIDER]',
  '[LEAD_RETENTION_PERIOD]',
  '[DATE_TBD]',
] as const;

/**
 * The canonical, ordered privacy-policy sections (UK GDPR). Plain-English.
 *
 * Single source of truth — rendered by every persona's privacy page.
 */
export const PRIVACY_POLICY_SECTIONS: PrivacySection[] = [
  {
    id: 'controller',
    heading: 'Who we are',
    body: [
      {
        type: 'paragraph',
        text:
          'This site is run by Angus Hally, who is the data controller responsible ' +
          'for the personal data described in this policy. If you have a question ' +
          'about your data, or want to make a data-protection request, contact ' +
          '[PRIVACY_CONTACT_EMAIL].',
      },
      {
        type: 'paragraph',
        text: 'Registered entity: [LEGAL_ENTITY].',
      },
    ],
  },
  {
    id: 'what-we-collect',
    heading: 'What we collect, why, and our lawful basis',
    body: [
      {
        type: 'paragraph',
        text:
          'We only collect the personal data we need for the purposes below, and ' +
          'for each we rely on a lawful basis under UK GDPR.',
      },
      {
        type: 'list',
        lead: 'We collect:',
        items: [
          'Contact form — your name, email address, subject, message, and the ' +
            'source (which persona or page you submitted from). Lawful basis: ' +
            'consent, and our legitimate interest in responding to your enquiry.',
          'Anti-spam — we use Google reCAPTCHA, which processes your IP address ' +
            'and interaction signals to tell humans from bots. Lawful basis: our ' +
            'legitimate interest in keeping forms secure.',
          'Analytics — we use PostHog product analytics (usage events) to ' +
            'understand how the site is used. Lawful basis: your consent; no ' +
            'analytics is collected unless you allow it.',
          'Account / sign-in (if used) — when you sign in we use Supabase ' +
            'authentication to manage your session. Lawful basis: performance of ' +
            'the service you have asked for.',
          'Preferences — your theme choice and your consent choices are stored ' +
            'locally in your browser so the site remembers them. Lawful basis: ' +
            'our legitimate interest in providing a consistent experience.',
        ],
      },
    ],
  },
  {
    id: 'cookies',
    heading: 'Cookies and local storage',
    body: [
      {
        type: 'paragraph',
        text:
          'We use a small number of cookies and browser-storage items, grouped ' +
          'into categories so you can control the non-essential ones.',
      },
      {
        type: 'list',
        lead: 'These are:',
        items: [
          'Supabase authentication cookies — strictly necessary; keep you signed ' +
            'in securely.',
          'Your consent choice — strictly necessary; remembers which cookie ' +
            'categories you have allowed.',
          'Theme preference ("mantine-color-scheme-value") — functional; ' +
            'remembers your light/dark choice.',
          'Google reCAPTCHA ("_GRECAPTCHA") — security; used for anti-spam ' +
            'protection on forms.',
          'PostHog cookies — analytics; set only after you give consent.',
        ],
      },
      {
        type: 'paragraph',
        text:
          'You can change your choices at any time in the cookie preference ' +
          'centre (the same "cookie preferences" link in the footer and on this ' +
          'page).',
      },
    ],
  },
  {
    id: 'sharing',
    heading: 'Who we share your data with',
    body: [
      {
        type: 'paragraph',
        text:
          'We do not sell your personal data. We share it only with the service ' +
          'providers (processors) we rely on to run the site, and only as needed ' +
          'for the purposes above.',
      },
      {
        type: 'list',
        lead: 'Our processors are:',
        items: [
          'Google — provides reCAPTCHA anti-spam protection.',
          'PostHog — provides product analytics, hosted in [POSTHOG_REGION].',
          'Supabase — provides hosting, authentication, and the database.',
          'Our email provider, [EMAIL_PROVIDER] — delivers the emails generated ' +
            'by the contact form.',
        ],
      },
    ],
  },
  {
    id: 'retention',
    heading: 'How long we keep your data',
    body: [
      {
        type: 'paragraph',
        text:
          'Contact submissions and the leads created from them are kept for ' +
          '[LEAD_RETENTION_PERIOD], after which they are deleted. We do not keep ' +
          'personal data for longer than we need it.',
      },
    ],
  },
  {
    id: 'international-transfers',
    heading: 'International transfers',
    body: [
      {
        type: 'paragraph',
        text:
          'Some of our processors may process your data outside the UK. Where ' +
          'they do, we rely on appropriate safeguards — such as a UK adequacy ' +
          'decision or Standard Contractual Clauses (SCCs) — to protect it. The ' +
          'exact position depends on where analytics is hosted ([POSTHOG_REGION]).',
      },
    ],
  },
  {
    id: 'your-rights',
    heading: 'Your rights',
    body: [
      {
        type: 'paragraph',
        text: 'Under UK GDPR you have the right to:',
      },
      {
        type: 'list',
        items: [
          'access the personal data we hold about you;',
          'have inaccurate data corrected (rectification);',
          'have your data deleted (erasure);',
          'restrict how we use your data;',
          'object to our processing;',
          'receive your data in a portable format (portability).',
        ],
      },
      {
        type: 'paragraph',
        text:
          'To exercise any of these rights, contact [PRIVACY_CONTACT_EMAIL]. ' +
          'Where we rely on your consent, you can withdraw it at any time using ' +
          'the cookie preference centre; withdrawing consent does not affect ' +
          'processing already carried out.',
      },
    ],
  },
  {
    id: 'complaints',
    heading: 'Complaints',
    body: [
      {
        type: 'paragraph',
        text:
          'If you are unhappy with how we have handled your data, you can ' +
          'complain to the Information Commissioner’s Office (ICO), the UK ' +
          'data-protection regulator, at ico.org.uk. We would appreciate the ' +
          'chance to address your concerns first via [PRIVACY_CONTACT_EMAIL].',
      },
    ],
  },
  {
    id: 'changes',
    heading: 'Changes to this policy',
    body: [
      {
        type: 'paragraph',
        text:
          'We may update this policy from time to time. When we make material ' +
          'changes we will update the date below.',
      },
      {
        type: 'paragraph',
        text: 'Last updated: [DATE_TBD].',
      },
    ],
  },
];

/**
 * The whole policy as one object, for renderers that prefer a single import.
 *
 * `draft`/`draftNotice` let a renderer show the DRAFT banner; `placeholders`
 * lets it (or a CI check) enumerate the owner-unknowns still to be filled.
 */
export const privacyPolicy = {
  draft: DRAFT,
  draftNotice: DRAFT_NOTICE,
  lastUpdated,
  placeholders: PRIVACY_POLICY_PLACEHOLDERS,
  sections: PRIVACY_POLICY_SECTIONS,
} as const;

export default privacyPolicy;
