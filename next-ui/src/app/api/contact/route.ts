import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { validateContactFormBody } from '@/lib/contact/validateContactForm';
import { sendAcknowledgmentToUser, sendContactFormEmail, sendInquiryToOwner } from '@/lib/email';
import {
  isRecaptchaTokenValidationError,
  verifyRecaptchaSite,
} from '@/lib/recaptcha/siteVerify';

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

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

  const errorCodes = verificationResult?.['error-codes'] ?? [];

  if (!verificationResult?.success) {
    if (isRecaptchaTokenValidationError(errorCodes)) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to verify reCAPTCHA token' }, { status: 502 });
  }

  if (errorCodes.length > 0) {
    return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
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
