const TOKEN_VALIDATION_ERRORS = new Set([
  'invalid-input-response',
  'missing-input-response',
  'timeout-or-duplicate',
]);

export type RecaptchaSiteVerifyResult = {
  success: boolean;
  'error-codes'?: string[];
};

export function isRecaptchaTokenValidationError(errorCodes: string[]): boolean {
  if (errorCodes.length === 0) return true;
  return errorCodes.every((code) => TOKEN_VALIDATION_ERRORS.has(code));
}

export async function verifyRecaptchaSite(token: string): Promise<RecaptchaSiteVerifyResult> {
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
