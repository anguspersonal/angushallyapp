export const MAX_ANALYSE_TEXT_LENGTH = 2000;

export type ValidatedAnalyseTextBody = { text: string };

export type AnalyseTextValidationFailure = {
  ok: false;
  error: string;
  status: number;
};

export type AnalyseTextValidationResult =
  | { ok: true; data: ValidatedAnalyseTextBody }
  | AnalyseTextValidationFailure;

export function validateAnalyseTextBody(body: unknown): AnalyseTextValidationResult {
  const { text } = (body as Record<string, unknown>) ?? {};

  if (typeof text !== 'string') {
    return { ok: false, error: 'Text input is required', status: 400 };
  }

  const trimmedText = text.trim();

  if (!trimmedText) {
    return { ok: false, error: 'Text input cannot be empty', status: 400 };
  }

  if (trimmedText.length > MAX_ANALYSE_TEXT_LENGTH) {
    return {
      ok: false,
      error: `Text input exceeds ${MAX_ANALYSE_TEXT_LENGTH} characters`,
      status: 413,
    };
  }

  return { ok: true, data: { text: trimmedText } };
}
