export type ValidatedInstagramAnalyzeBody = { instagramUrl: string };

export type InstagramAnalyzeValidationResult =
  | { ok: true; data: ValidatedInstagramAnalyzeBody }
  | { ok: false; error: string; status: number };

export function validateInstagramAnalyzeBody(
  body: unknown,
): InstagramAnalyzeValidationResult {
  const { instagramUrl } = (body as Record<string, unknown>) ?? {};

  if (typeof instagramUrl !== 'string') {
    return { ok: false, error: 'Valid Instagram URL required', status: 400 };
  }

  const trimmed = instagramUrl.trim();
  if (!trimmed || !trimmed.includes('instagram.com')) {
    return { ok: false, error: 'Valid Instagram URL required', status: 400 };
  }

  return { ok: true, data: { instagramUrl: trimmed } };
}
