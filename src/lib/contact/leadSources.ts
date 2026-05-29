/**
 * Known lead sources — the surfaces allowed to submit the contact form.
 *
 * `source` attributes each persisted lead to the surface that produced it
 * (PRD #123: "each lead tagged with its source persona"). Validation rejects
 * any value outside this set so a typo or a spoofed client can't pollute the
 * attribution column. Adding a persona here is the only change required to
 * accept its submissions — no DDL change (the column is free text; this set is
 * the application-layer constraint).
 */
export const LEAD_SOURCES = [
  'contact_page', // the main-site /contact form (default)
  'teacher',
  'strategist',
  'ai-pm',
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

/** The source assumed when a client omits it (the existing /contact form). */
export const DEFAULT_LEAD_SOURCE: LeadSource = 'contact_page';

export function isLeadSource(value: unknown): value is LeadSource {
  return typeof value === 'string' && (LEAD_SOURCES as readonly string[]).includes(value);
}
