/**
 * Consent-management platform — types & category catalogue (issue #140, PRD #123 Feature D).
 *
 * The platform models user consent as a set of granular *categories*. Each
 * category gates a class of non-essential cookies / scripts; code defers
 * loading them until the matching category is consented (see useConsentGate).
 *
 * Categorisation (documented per the acceptance criteria):
 *
 *  - `necessary`  — Strictly necessary. ALWAYS ON, not user-toggleable.
 *                   Covers Supabase auth (session cookies) and the consent
 *                   record itself. Cannot be rejected; the site cannot function
 *                   without it.
 *  - `security`   — Security / anti-spam. Covers Google reCAPTCHA. reCAPTCHA is
 *                   loaded *on contact-form interaction* as a legitimate
 *                   anti-spam measure; this category lets a user opt out of the
 *                   widget up-front, but interacting users still get it (see
 *                   docs/consent-categorisation.md).
 *  - `analytics`  — Analytics. Covers PostHog (stood up consent-gated in #141).
 *  - `functional` — Functional. Covers non-essential preference cookies such as
 *                   the day/night theme preference.
 *
 * This module is pure (no React, no DOM) so the state machine is unit-testable.
 */

/** The non-necessary, user-toggleable categories plus the always-on necessary one. */
export type ConsentCategory = 'necessary' | 'security' | 'analytics' | 'functional';

/** Categories a user can actually toggle (everything except always-on necessary). */
export type ToggleableCategory = Exclude<ConsentCategory, 'necessary'>;

/** Per-category boolean grants. `necessary` is always true. */
export type ConsentChoices = Record<ConsentCategory, boolean>;

/**
 * The persisted consent record. `version` lets us invalidate stored consent if
 * the category catalogue changes materially; `decidedAt` records when the user
 * last made an explicit choice (null === no decision yet → banner shows).
 */
export interface ConsentRecord {
  version: number;
  /** null until the user makes an explicit accept/reject/save choice. */
  decidedAt: string | null;
  choices: ConsentChoices;
}

/** Static, display-facing metadata for a category. Drives the preference center. */
export interface ConsentCategoryMeta {
  id: ConsentCategory;
  label: string;
  description: string;
  /** Example vendors/scripts gated by this category, for the preference center. */
  examples: string;
  /** Always-on categories are rendered read-only (toggle disabled, forced on). */
  alwaysOn: boolean;
}

/** Bump when the category set or their meaning changes materially. */
export const CONSENT_VERSION = 1;

/** localStorage key holding the serialized ConsentRecord. */
export const CONSENT_STORAGE_KEY = 'ah-consent-v1';

/**
 * Ordered catalogue of categories. Order is the display order in the
 * preference center. Necessary first (always on), then the opt-in categories.
 */
export const CONSENT_CATEGORIES: ConsentCategoryMeta[] = [
  {
    id: 'necessary',
    label: 'Strictly necessary',
    description:
      'Required for the site to work — secure sign-in sessions and remembering your cookie choices. These are always on and cannot be switched off.',
    examples: 'Supabase authentication, consent preferences',
    alwaysOn: true,
  },
  {
    id: 'security',
    label: 'Security & anti-spam',
    description:
      'Protects forms from abuse. reCAPTCHA loads when you interact with the contact form to verify you are human; you can opt out here, though submitting a form will still trigger the check.',
    examples: 'Google reCAPTCHA',
    alwaysOn: false,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description:
      'Helps me understand which pages are useful so I can improve them. No analytics scripts load until you allow this.',
    examples: 'PostHog',
    alwaysOn: false,
  },
  {
    id: 'functional',
    label: 'Functional',
    description:
      'Remembers non-essential preferences, such as your day/night theme choice, between visits.',
    examples: 'Theme preference',
    alwaysOn: false,
  },
];

/** The toggleable category ids, in catalogue order. */
export const TOGGLEABLE_CATEGORIES: ToggleableCategory[] = CONSENT_CATEGORIES.filter(
  (c) => !c.alwaysOn,
).map((c) => c.id) as ToggleableCategory[];
