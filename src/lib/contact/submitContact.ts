import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import { sendAcknowledgmentToUser, sendInquiryToOwner } from '@/lib/email';
import { EmailConfigError } from '@/lib/email/errors';
import { isRecaptchaTokenValidationError, verifyRecaptchaSite } from '@/lib/recaptcha/siteVerify';
import { createLead, type Lead } from './leadRepository';
import type { ValidatedContactForm } from './validateContactForm';

/**
 * Contact submission service (PRD #123, issue #124).
 *
 * Extracts the route's flow into a testable unit:
 *   verify reCAPTCHA → persist lead → send owner + acknowledgment emails.
 *
 * The body is assumed already validated/normalised by `validateContactFormBody`
 * (the Route Handler runs the validator before calling this). The service is
 * HTTP-agnostic: every failure mode throws `HttpError` so the route's
 * `publicHandler` wrapper maps it to the `{ error, code? }` envelope (ADR-0036).
 *
 * Failure-mode separation (fixes #102 — previously every email failure
 * collapsed into one opaque 500):
 *   - reCAPTCHA token invalid     → 400 'reCAPTCHA verification failed'
 *   - reCAPTCHA server-side error → 502 'Failed to verify reCAPTCHA token'
 *   - email misconfigured         → 500 'Email service misconfigured'   (operator fix)
 *   - email transiently down      → 502 'Email service unavailable'     (retryable)
 *
 * The lead is persisted BEFORE emails are attempted, so a transient mailer
 * outage never loses the inquiry (PRD: "inquiries aren't lost if an email is
 * missed"). reCAPTCHA failures short-circuit before any persistence or email.
 */

export interface SubmitContactDeps {
  /** Service-role client; null when Supabase env is unconfigured. */
  admin: SupabaseClient | null;
}

export interface SubmitContactResult {
  message: string;
  /** The persisted lead, or null when Supabase is unconfigured (email still sent). */
  lead: Lead | null;
}

export async function submitContact(
  input: ValidatedContactForm,
  deps: SubmitContactDeps,
): Promise<SubmitContactResult> {
  await verifyRecaptchaOrThrow(input.recaptchaToken);

  // Persist first so a missed/failed email never loses the inquiry. Degrade
  // gracefully when Supabase is unconfigured (e.g. partial local dev): the
  // email path below still runs, matching the no-op-when-unavailable posture
  // of src/lib/chat/persistence.ts.
  let lead: Lead | null = null;
  if (deps.admin) {
    lead = await createLead(deps.admin, {
      source: input.source,
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    });
  }

  await sendEmailsOrThrow(input);

  return { message: 'Contact form submitted successfully', lead };
}

async function verifyRecaptchaOrThrow(token: string): Promise<void> {
  let result: Awaited<ReturnType<typeof verifyRecaptchaSite>>;
  try {
    result = await verifyRecaptchaSite(token);
  } catch {
    throw new HttpError(502, 'Failed to verify reCAPTCHA token');
  }

  const errorCodes = result['error-codes'] ?? [];

  if (!result.success) {
    if (isRecaptchaTokenValidationError(errorCodes)) {
      throw new HttpError(400, 'reCAPTCHA verification failed');
    }
    throw new HttpError(502, 'Failed to verify reCAPTCHA token');
  }

  // success === true but warning codes present → treat as a failed challenge.
  if (errorCodes.length > 0) {
    throw new HttpError(400, 'reCAPTCHA verification failed');
  }
}

async function sendEmailsOrThrow(input: ValidatedContactForm): Promise<void> {
  const { name, email, subject, message } = input;
  try {
    // One owner notification + one user acknowledgment per submission.
    // reply-to is set to the visitor's address inside sendInquiryToOwner so the
    // owner can reply directly (existing Nodemailer behaviour, preserved).
    await sendInquiryToOwner({ name, email, subject, message });
    await sendAcknowledgmentToUser(name, email, message);
  } catch (error) {
    // Log the underlying cause (SMTP auth, ECONNREFUSED, expired OAuth refresh
    // token, etc.) so the operator sees the real error behind the 5xx — #102.
    logSendError(error);

    if (error instanceof EmailConfigError) {
      throw new HttpError(500, 'Email service misconfigured', 'email_misconfigured');
    }
    throw new HttpError(502, 'Email service unavailable', 'email_unavailable');
  }
}

function logSendError(error: unknown): void {
  if (error instanceof Error) {
    const code = (error as { code?: unknown }).code;
    console.error('Contact form submission error:', {
      name: error.name,
      message: error.message,
      code: typeof code === 'string' || typeof code === 'number' ? code : undefined,
      stack: error.stack,
    });
  } else {
    console.error('Contact form submission error (non-Error):', error);
  }
}
