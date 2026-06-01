import { publicHandler } from '@/lib/api/handler';
import { submitContact } from '@/lib/contact/submitContact';
import { validateContactFormBody } from '@/lib/contact/validateContactForm';
import { validateEmailEnvOnce } from '@/lib/email/envValidation';

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
  },
);
