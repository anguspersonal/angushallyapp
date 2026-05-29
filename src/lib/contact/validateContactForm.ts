import { DEFAULT_LEAD_SOURCE, isLeadSource, type LeadSource } from './leadSources';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidatedContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
  source: LeadSource;
  recaptchaToken: string;
};

/**
 * Validates and normalises a contact-form submission body.
 *
 * Additive on the prior contract:
 *  - `subject` is now captured (previously silently dropped). Required.
 *  - `source` attributes the lead to a surface. Optional: an omitted/blank
 *    source defaults to the main-site form (`contact_page`) so the existing
 *    /contact client — which posts no `source` — keeps working unchanged. A
 *    *provided* source must be in the known set (src/lib/contact/leadSources.ts).
 */
export function validateContactFormBody(
  body: unknown
): { ok: true; data: ValidatedContactForm } | { ok: false; errors: string[] } {
  const { name, email, subject, message, source, recaptchaToken } =
    (body as Record<string, unknown>) ?? {};

  const errors: string[] = [];
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required');
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    errors.push('Valid email is required');
  }
  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    errors.push('Subject is required');
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    errors.push('Message is required');
  }
  // Source is optional. A present-but-invalid value is rejected; absent/blank
  // falls back to the default below (behaviour-additive for existing clients).
  const sourceProvided =
    source !== undefined && source !== null && !(typeof source === 'string' && !source.trim());
  if (sourceProvided && !isLeadSource(source)) {
    errors.push('Invalid source');
  }
  if (!recaptchaToken || typeof recaptchaToken !== 'string' || !recaptchaToken.trim()) {
    errors.push('reCAPTCHA verification required');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name: (name as string).trim(),
      email: (email as string).toLowerCase(),
      subject: (subject as string).trim(),
      message: (message as string).trim(),
      source: sourceProvided ? (source as LeadSource) : DEFAULT_LEAD_SOURCE,
      recaptchaToken: (recaptchaToken as string).trim(),
    },
  };
}
