import { publicHandler } from '@/lib/api/handler';
import { submitContact } from '@/lib/contact/submitContact';
import { validateContactFormBody } from '@/lib/contact/validateContactForm';
import { validateEmailEnvOnce } from '@/lib/email/envValidation';
import { sendAcknowledgmentToUser, sendInquiryToOwner } from '@/lib/email';
import { EmailConfigError } from '@/lib/email/errors';
import { validateEmailEnvOnce } from '@/lib/email/envValidation';
import { nextResponseIfRecaptchaInvalid } from '@/lib/recaptcha/nextResponseForRecaptchaResult';
import { verifyRecaptchaSite } from '@/lib/recaptcha/siteVerify';

/**
 * POST /api/contact
 *
 * Thin wrapper over the `submitContact` service (verify reCAPTCHA → persist
 * lead → send owner + acknowledgment emails). All flow + failure-mode logic
 * lives in src/lib/contact/submitContact.ts, which is unit-tested with faked
 * collaborators; this handler only wires validation, the admin client, and the
 * one-time env sanity check.
 *
 * Accepts `{ name, email, subject, message, source?, recaptchaToken }`. The
 * service throws `HttpError` for every failure mode and the `publicHandler`
 * wrapper maps it to the `{ error, code? }` envelope.
 */
export const POST = publicHandler(
  { body: validateContactFormBody },
  async ({ body, admin }) => {
    // One-time env-var sanity check per process. Fail-open: warnings are
    // logged but never block a request — see src/lib/email/envValidation.ts.
    validateEmailEnvOnce();

    const { message } = await submitContact(body, { admin });
    return { message };
  async ({ body }) => {
    // One-time env-var sanity check per process. Fail-open: warnings are
    // logged but never block a request — see src/lib/email/envValidation.ts.
    validateEmailEnvOnce();

    const { name, email, message, recaptchaToken } = body;

    let verificationResult: Awaited<ReturnType<typeof verifyRecaptchaSite>>;
    try {
      verificationResult = await verifyRecaptchaSite(recaptchaToken);
    } catch {
      throw new HttpError(502, 'Failed to verify reCAPTCHA token');
    }

    const recaptchaError = nextResponseIfRecaptchaInvalid(verificationResult);
    if (recaptchaError) {
      return recaptchaError;
    }

    try {
      // One owner notification + one user acknowledgment per submission.
      await sendInquiryToOwner({ name, email, message });
      await sendAcknowledgmentToUser(name, email, message);
    } catch (error) {
      // Log the underlying error so the operator can see the real cause
      // (SMTP auth, ECONNREFUSED, expired OAuth refresh token, etc.)
      // rather than just the generic 5xx that gets returned.
      logSendError(error);

      if (error instanceof EmailConfigError) {
        throw new HttpError(500, 'Email service misconfigured', 'email_misconfigured');
      }
      throw new HttpError(502, 'Email service unavailable', 'email_unavailable');
    }

    return { message: 'Contact form submitted successfully' };
  },
);

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
