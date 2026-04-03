const { isRecaptchaTokenValidationError } = require('./recaptchaSiteVerify');

/**
 * @param {object} verificationResult — body from Google siteverify
 * @returns {null | { status: number, body: object, log: { level: 'warn' | 'error', message: string, errorCodes: string[] } }}
 */
function outcomeForRecaptchaVerification(verificationResult) {
  const errorCodes = verificationResult?.['error-codes'] || [];

  if (!verificationResult?.success) {
    if (isRecaptchaTokenValidationError(errorCodes)) {
      return {
        status: 400,
        body: { error: 'reCAPTCHA verification failed' },
        log: { level: 'warn', message: 'Invalid reCAPTCHA token', errorCodes },
      };
    }
    return {
      status: 502,
      body: { error: 'Failed to verify reCAPTCHA token' },
      log: { level: 'error', message: 'reCAPTCHA upstream verification error', errorCodes },
    };
  }

  if (errorCodes.length > 0) {
    return {
      status: 400,
      body: { error: 'reCAPTCHA verification failed' },
      log: { level: 'warn', message: 'reCAPTCHA returned warnings', errorCodes },
    };
  }

  return null;
}

module.exports = { outcomeForRecaptchaVerification };
