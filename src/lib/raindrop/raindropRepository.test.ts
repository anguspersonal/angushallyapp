import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import {
  getRaindropAccessToken,
  upsertTokens,
  userHasRaindropTokens,
} from './raindropRepository';

interface StubResult {
  data?: unknown;
  error?: unknown;
}

function supabaseStub(result: StubResult): SupabaseClient {
  const stub: Record<string, unknown> = {
    then: (resolve: (v: StubResult) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
  for (const m of [
    'schema', 'from', 'select', 'eq', 'limit', 'maybeSingle', 'upsert',
  ]) {
    stub[m] = vi.fn(() => stub);
  }
  return stub as unknown as SupabaseClient;
}

describe('upsertTokens', () => {
  it('persists tokens with computed expires_at', async () => {
    const upsert = vi.fn((..._args: unknown[]) =>
      Promise.resolve({ data: null, error: null }),
    );
    const from = vi.fn((..._args: unknown[]) => ({ upsert }));
    const schema = vi.fn((..._args: unknown[]) => ({ from }));
    const admin = { schema } as unknown as SupabaseClient;

    await upsertTokens(admin, 'user-1', 'access', 'refresh', 3600);

    expect(schema).toHaveBeenCalledWith('raindrop');
    expect(from).toHaveBeenCalledWith('tokens');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        access_token: 'access',
        refresh_token: 'refresh',
        expires_at: expect.any(String),
      }),
      { onConflict: 'user_id' },
    );
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(
      upsertTokens(admin, 'user-1', 'access', 'refresh', 3600),
    ).rejects.toBeInstanceOf(HttpError);
    consoleError.mockRestore();
  });
});

describe('userHasRaindropTokens', () => {
  it('returns true when token row exists', async () => {
    const admin = supabaseStub({ data: { user_id: 'user-1' }, error: null });
    expect(await userHasRaindropTokens(admin, 'user-1')).toBe(true);
  });

  it('returns false when no token row', async () => {
    const admin = supabaseStub({ data: null, error: null });
    expect(await userHasRaindropTokens(admin, 'user-1')).toBe(false);
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(userHasRaindropTokens(admin, 'user-1')).rejects.toMatchObject({
      status: 500,
    });
    consoleError.mockRestore();
  });
});

describe('getRaindropAccessToken', () => {
  it('returns the access token when present', async () => {
    const admin = supabaseStub({
      data: { access_token: 'abc' },
      error: null,
    });
    expect(await getRaindropAccessToken(admin, 'user-1')).toBe('abc');
  });

  it('returns null when not connected', async () => {
    const admin = supabaseStub({ data: null, error: null });
    expect(await getRaindropAccessToken(admin, 'user-1')).toBeNull();
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(getRaindropAccessToken(admin, 'user-1')).rejects.toBeInstanceOf(
      HttpError,
    );
    consoleError.mockRestore();
  });
});
