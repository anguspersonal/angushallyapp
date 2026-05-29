import { describe, it, expect } from 'vitest';
import {
  DRAFT,
  lastUpdated,
  DRAFT_NOTICE,
  PRIVACY_POLICY_PLACEHOLDERS,
  PRIVACY_POLICY_SECTIONS,
  privacyPolicy,
} from './privacyPolicy';

/**
 * Guards the canonical privacy-policy content module (#126). It is the single
 * source the per-persona privacy pages (#128) render, so these assertions pin
 * the shape (sections + DRAFT flag) the renderers depend on.
 */
describe('privacyPolicy content module', () => {
  it('is still flagged as a DRAFT awaiting human legal review', () => {
    expect(DRAFT).toBe(true);
    expect(privacyPolicy.draft).toBe(true);
  });

  it('exposes a visible draft notice mentioning placeholders', () => {
    expect(DRAFT_NOTICE).toMatch(/DRAFT/);
    expect(DRAFT_NOTICE).toMatch(/PLACEHOLDERS?/i);
    expect(privacyPolicy.draftNotice).toBe(DRAFT_NOTICE);
  });

  it('leaves "Last updated" as a literal placeholder (no invented date)', () => {
    expect(lastUpdated).toBe('[DATE_TBD]');
    expect(privacyPolicy.lastUpdated).toBe('[DATE_TBD]');
  });

  it('exports the expected ordered sections', () => {
    const expectedIds = [
      'controller',
      'what-we-collect',
      'cookies',
      'sharing',
      'retention',
      'international-transfers',
      'your-rights',
      'complaints',
      'changes',
    ];
    expect(PRIVACY_POLICY_SECTIONS.map((s) => s.id)).toEqual(expectedIds);
    expect(privacyPolicy.sections).toBe(PRIVACY_POLICY_SECTIONS);
  });

  it('gives every section a heading and a non-empty body', () => {
    for (const section of PRIVACY_POLICY_SECTIONS) {
      expect(section.heading.trim().length).toBeGreaterThan(0);
      expect(section.body.length).toBeGreaterThan(0);
      for (const block of section.body) {
        if (block.type === 'paragraph') {
          expect(block.text.trim().length).toBeGreaterThan(0);
        } else {
          expect(block.items.length).toBeGreaterThan(0);
          for (const item of block.items) {
            expect(item.trim().length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('names Angus Hally as the data controller (ADR 0035 owner carve-out)', () => {
    const controller = PRIVACY_POLICY_SECTIONS.find((s) => s.id === 'controller');
    const text = JSON.stringify(controller);
    expect(text).toContain('Angus Hally');
    expect(text).toMatch(/data controller/i);
  });

  it('enumerates the bracketed owner-unknown placeholders', () => {
    expect([...PRIVACY_POLICY_PLACEHOLDERS]).toEqual([
      '[PRIVACY_CONTACT_EMAIL]',
      '[LEGAL_ENTITY]',
      '[POSTHOG_REGION]',
      '[EMAIL_PROVIDER]',
      '[LEAD_RETENTION_PERIOD]',
      '[DATE_TBD]',
    ]);
    expect(privacyPolicy.placeholders).toBe(PRIVACY_POLICY_PLACEHOLDERS);
  });

  it('actually uses every declared placeholder somewhere in the content', () => {
    const haystack = JSON.stringify({
      lastUpdated,
      sections: PRIVACY_POLICY_SECTIONS,
    });
    for (const placeholder of PRIVACY_POLICY_PLACEHOLDERS) {
      expect(haystack).toContain(placeholder);
    }
  });

  it('covers the required UK GDPR topics in plain English', () => {
    const haystack = JSON.stringify(PRIVACY_POLICY_SECTIONS);
    // Collection + lawful basis
    expect(haystack).toMatch(/lawful basis/i);
    expect(haystack).toMatch(/legitimate interest/i);
    expect(haystack).toMatch(/consent/i);
    // Specific processors / tech named in the issue
    expect(haystack).toMatch(/reCAPTCHA/i);
    expect(haystack).toMatch(/PostHog/i);
    expect(haystack).toMatch(/Supabase/i);
    // Cookie keys
    expect(haystack).toContain('mantine-color-scheme-value');
    expect(haystack).toContain('_GRECAPTCHA');
    // Rights + regulator
    expect(haystack).toMatch(/rectification/i);
    expect(haystack).toMatch(/erasure/i);
    expect(haystack).toMatch(/portability/i);
    expect(haystack).toMatch(/ICO|ico\.org\.uk/i);
    // No selling of personal data
    expect(haystack).toMatch(/not sell/i);
  });

  it('names no third-party individuals (ADR 0035)', () => {
    // Only the owner (Angus Hally) may be named. We allow-list the owner plus the
    // capitalised multi-word *proper nouns* that legitimately appear (org /
    // legal terms), then assert nothing else that looks like a personal name
    // survives. This catches an accidentally-added third-party name without
    // flagging "Standard Contractual Clauses" etc.
    const allowList = [
      'Angus Hally',
      'Google reCAPTCHA',
      'Standard Contractual Clauses',
      'Information Commissioner', // "Information Commissioner’s Office (ICO)"
    ];
    const text = PRIVACY_POLICY_SECTIONS.map((s) =>
      s.body
        .map((b) => (b.type === 'paragraph' ? b.text : b.items.join(' ')))
        .join(' '),
    ).join(' ');
    let stripped = text;
    for (const allowed of allowList) {
      stripped = stripped.split(allowed).join(' ');
    }
    // No remaining capitalised two-word personal-name pattern.
    expect(stripped).not.toMatch(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/);
  });
});
