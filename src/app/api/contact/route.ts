import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { parseRequestJson } from '@/lib/api/parseRequestJson';
import { validateContactFormBody } from '@/lib/contact/validateContactForm';
import { sendAcknowledgmentToUser, sendContactFormEmail, sendInquiryToOwner } from '@/lib/email';
import { nextResponseIfRecaptchaInvalid } from '@/lib/recaptcha/nextResponseForRecaptchaResult';
import { verifyRecaptchaSite } from '@/lib/recaptcha/siteVerify';

export async function POST(request: NextRequest) {
  const parsed = await parseRequestJson(request);
  if (!parsed.ok) {
    return parsed.response;
  }
  const { body } = parsed;

  const validation = validateContactFormBody(body);
  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const { name, email, message, recaptchaToken } = validation.data;

  let verificationResult: Awaited<ReturnType<typeof verifyRecaptchaSite>>;
  try {
    verificationResult = await verifyRecaptchaSite(recaptchaToken);
  } catch {
    return NextResponse.json({ error: 'Failed to verify reCAPTCHA token' }, { status: 502 });
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
    return NextResponse.json(
      { error: 'Failed to process contact form submission' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'Contact form submitted successfully' });
}
