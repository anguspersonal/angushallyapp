const MAX_TEXT_LENGTH = 2000;
const MAX_PAYLOAD_BYTES = 10 * 1024; // 10kb

/**
 * @param {unknown} text
 * @returns {{ ok: true, trimmedText: string } | { ok: false, status: number, error: string, reason: string, length?: number, payloadBytes?: number }}
 */
function validateAnalyseTextPayload(text) {
  if (typeof text !== 'string') {
    return { ok: false, status: 400, error: 'Text input is required', reason: 'missing-text' };
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    return { ok: false, status: 400, error: 'Text input cannot be empty', reason: 'empty-text' };
  }

  if (trimmedText.length > MAX_TEXT_LENGTH) {
    return {
      ok: false,
      status: 413,
      error: `Text input exceeds ${MAX_TEXT_LENGTH} characters`,
      reason: 'text-too-long',
      length: trimmedText.length,
    };
  }

  const textBytes = Buffer.byteLength(trimmedText, 'utf8');
  if (textBytes > MAX_PAYLOAD_BYTES) {
    return {
      ok: false,
      status: 413,
      error: 'Text input is too large',
      reason: 'payload-bytes',
      payloadBytes: textBytes,
    };
  }

  return { ok: true, trimmedText };
}

module.exports = {
  validateAnalyseTextPayload,
  MAX_TEXT_LENGTH,
  MAX_PAYLOAD_BYTES,
};
