const TOKEN_VALIDATION_ERRORS = new Set([
  'invalid-input-response',
  'missing-input-response',
  'timeout-or-duplicate',
]);

function isRecaptchaTokenValidationError(errorCodes = []) {
  if (errorCodes.length === 0) {
    return true;
  }
  return errorCodes.every((code) => TOKEN_VALIDATION_ERRORS.has(code));
}

/**
 * @param {object} params
 * @param {{ post: Function }} params.httpClient
 * @param {string} params.verifyUrl
 * @param {string} params.secret
 * @param {string} params.token
 * @param {string} [params.remoteip]
 * @param {{ error: Function }} params.logger
 * @param {string} [params.correlationId]
 */
async function verifyRecaptchaToken({
  httpClient,
  verifyUrl,
  secret,
  token,
  remoteip = '',
  logger,
  correlationId,
}) {
  try {
    const response = await httpClient.post(
      verifyUrl,
      new URLSearchParams({ secret, response: token, remoteip }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    return response.data;
  } catch (error) {
    logger.error('reCAPTCHA verification error', { correlationId, error });
    throw new Error('recaptcha_verification_error');
  }
}

module.exports = {
  isRecaptchaTokenValidationError,
  verifyRecaptchaToken,
};
