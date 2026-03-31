import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendInquiryToOwner, sendAcknowledgmentToUser, sendContactFormEmail } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOKEN_VALIDATION_ERRORS = new Set([
  'invalid-input-response',
  'missing-input-response',
  'timeout-or-duplicate',
]);

function isTokenValidationError(errorCodes: string[]): boolean {
  if (errorCodes.length === 0) return true;
  return errorCodes.every((code) => TOKEN_VALIDATION_ERRORS.has(code));
}

async function verifyRecaptcha(token: string): Promise<{ success: boolean; 'error-codes'?: string[] }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: secret ?? '', response: token }).toString(),
  });

  if (!response.ok) {
    throw new Error('recaptcha_verification_error');
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { name, email, message, recaptchaToken } = (body as Record<string, unknown>) ?? {};

  // Validate fields
  const errors: string[] = [];
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required');
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    errors.push('Valid email is required');
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    errors.push('Message is required');
  }
  if (!recaptchaToken || typeof recaptchaToken !== 'string' || !recaptchaToken.trim()) {
    errors.push('reCAPTCHA verification required');
  }

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Verify reCAPTCHA
  let verificationResult: { success: boolean; 'error-codes'?: string[] };
  try {
    verificationResult = await verifyRecaptcha(recaptchaToken as string);
  } catch {
    return NextResponse.json(
      { error: 'Failed to verify reCAPTCHA token' },
      { status: 502 }
    );
  }

  const errorCodes = verificationResult?.['error-codes'] ?? [];

  if (!verificationResult?.success) {
    if (isTokenValidationError(errorCodes)) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to verify reCAPTCHA token' }, { status: 502 });
  }

  if (errorCodes.length > 0) {
    return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
  }

  const trimmedName = (name as string).trim();
  const trimmedMessage = (message as string).trim();
  const normalizedEmail = (email as string).toLowerCase();

  try {
    await sendInquiryToOwner({ name: trimmedName, email: normalizedEmail, message: trimmedMessage });
    await sendAcknowledgmentToUser(trimmedName, normalizedEmail, trimmedMessage);
    await sendContactFormEmail({ name: trimmedName, email: normalizedEmail, message: trimmedMessage });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form submission' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'Contact form submitted successfully' });
}
