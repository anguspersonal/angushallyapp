import { HttpError, publicHandler } from '@/lib/api/handler';
import { validateContactFormBody } from '@/lib/contact/validateContactForm';
import { sendAcknowledgmentToUser, sendContactFormEmail, sendInquiryToOwner } from '@/lib/email';
import { nextResponseIfRecaptchaInvalid } from '@/lib/recaptcha/nextResponseForRecaptchaResult';
import { verifyRecaptchaSite } from '@/lib/recaptcha/siteVerify';

export const POST = publicHandler(
  { body: validateContactFormBody },
  async ({ body }) => {
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
      await sendInquiryToOwner({ name, email, message });
      await sendAcknowledgmentToUser(name, email, message);
      await sendContactFormEmail({ name, email, message });
    } catch (error) {
      console.error('Contact form submission error:', error);
      throw new HttpError(500, 'Failed to process contact form submission');
    }

    return { message: 'Contact form submitted successfully' };
  },
);
