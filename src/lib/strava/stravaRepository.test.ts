import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import {
  listStravaActivitiesForUser,
  userHasStravaTokens,
} from './stravaRepository';

interface StubResult {
  data?: unknown;
  error?: unknown;
}

function supabaseStub(result: StubResult): SupabaseClient {
  const stub: Record<string, unknown> = {
    then: (resolve: (v: StubResult) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
  for (const m of ['schema', 'from', 'select', 'eq', 'order', 'limit', 'maybeSingle']) {
    stub[m] = vi.fn(() => stub);
  }
  return stub as unknown as SupabaseClient;
}

describe('userHasStravaTokens', () => {
  it('returns true when a token row exists', async () => {
    const admin = supabaseStub({ data: { id: 1 }, error: null });
    expect(await userHasStravaTokens(admin, 'user-1')).toBe(true);
  });

  it('returns false when no token row exists', async () => {
    const admin = supabaseStub({ data: null, error: null });
    expect(await userHasStravaTokens(admin, 'user-1')).toBe(false);
  });

  // Behaviour change: previously returned `false` on DB error (silently
  // surfacing as 403 'not connected'). Now throws so the handler returns 500.
  it('throws HttpError(500) on Supabase error (no longer silently false)', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(userHasStravaTokens(admin, 'user-1')).rejects.toMatchObject({
      status: 500,
    });
    consoleError.mockRestore();
  });
});

describe('listStravaActivitiesForUser', () => {
  it('returns activities array on success', async () => {
    const admin = supabaseStub({ data: [{ id: 1 }, { id: 2 }], error: null });
    expect(await listStravaActivitiesForUser(admin, 'user-1')).toHaveLength(2);
  });

  it('returns empty array when no activities', async () => {
    const admin = supabaseStub({ data: null, error: null });
    expect(await listStravaActivitiesForUser(admin, 'user-1')).toEqual([]);
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(listStravaActivitiesForUser(admin, 'user-1')).rejects.toBeInstanceOf(
      HttpError,
    );
    consoleError.mockRestore();
  });
});
