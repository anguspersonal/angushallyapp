import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import { analyseInstagramUrl } from './instagramAnalysis';

interface StubResult {
  data?: unknown;
  error?: unknown;
}

function supabaseStub(result: StubResult): SupabaseClient {
  const stub: Record<string, unknown> = {
    then: (resolve: (v: StubResult) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
  for (const m of ['schema', 'from', 'upsert']) {
    stub[m] = vi.fn(() => stub);
  }
  return stub as unknown as SupabaseClient;
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  // Strip integration env vars so Apify and OpenAI return early
  // (no fetch is made — the test exercises the orchestrator spine only).
  delete process.env.APIFY_API_TOKEN;
  delete process.env.APIFY_INSTAGRAM_ACTOR_ID;
  delete process.env.OPENAI_API_KEY;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('analyseInstagramUrl', () => {
  it('returns the canonical response shape when external services are unconfigured', async () => {
    const admin = supabaseStub({ data: null, error: null });
    const result = await analyseInstagramUrl(
      admin,
      'user-1',
      'https://www.instagram.com/p/abc/',
    );

    expect(result.success).toBe(true);
    expect(result.data.metadata).toEqual({
      url: 'https://www.instagram.com/p/abc/',
    });
    expect(result.data.analysis).toMatchObject({
      threadId: '',
      runId: '',
      metadata: { url: 'https://www.instagram.com/p/abc/' },
      analysis_result: {},
    });
  });

  it('throws HttpError(500) when persistence fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(
      analyseInstagramUrl(admin, 'user-1', 'https://www.instagram.com/p/abc/'),
    ).rejects.toBeInstanceOf(HttpError);
    await expect(
      analyseInstagramUrl(admin, 'user-1', 'https://www.instagram.com/p/abc/'),
    ).rejects.toMatchObject({ status: 500 });
    consoleError.mockRestore();
  });

  it('persists the analysis under the correct schema and table', async () => {
    const upsert = vi.fn(() => Promise.resolve({ data: null, error: null }));
    const from = vi.fn(() => ({ upsert }));
    const schema = vi.fn(() => ({ from }));
    const admin = { schema } as unknown as SupabaseClient;

    await analyseInstagramUrl(
      admin,
      'user-42',
      'https://www.instagram.com/p/xyz/',
    );

    expect(schema).toHaveBeenCalledWith('bookmarks');
    expect(from).toHaveBeenCalledWith('instagram_analyses');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-42',
        instagram_url: 'https://www.instagram.com/p/xyz/',
        metadata: { url: 'https://www.instagram.com/p/xyz/' },
      }),
      { onConflict: 'user_id,instagram_url' },
    );
  });
});
