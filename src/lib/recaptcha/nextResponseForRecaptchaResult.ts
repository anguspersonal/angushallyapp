import { NextResponse } from 'next/server';
import { isRecaptchaTokenValidationError, type RecaptchaSiteVerifyResult } from './siteVerify';

function recaptchaVerificationFailedResponse(): NextResponse {
  return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
}

/**
 * If verification failed or returned warning codes, the appropriate error response; otherwise null.
 */
export function nextResponseIfRecaptchaInvalid(
  verificationResult: RecaptchaSiteVerifyResult | undefined,
): NextResponse | null {
  const errorCodes = verificationResult?.['error-codes'] ?? [];

  if (!verificationResult?.success) {
    if (isRecaptchaTokenValidationError(errorCodes)) {
      return recaptchaVerificationFailedResponse();
    }
    return NextResponse.json({ error: 'Failed to verify reCAPTCHA token' }, { status: 502 });
  }

  if (errorCodes.length > 0) {
    return recaptchaVerificationFailedResponse();
  }

  return null;
}
