import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import { syncBookmarksForUser } from './raindropSync';

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
    'schema', 'from', 'select', 'eq', 'maybeSingle', 'upsert',
  ]) {
    stub[m] = vi.fn(() => stub);
  }
  return stub as unknown as SupabaseClient;
}

describe('syncBookmarksForUser', () => {
  it('throws HttpError(403) when user is not connected to Raindrop', async () => {
    const admin = supabaseStub({ data: null, error: null });
    await expect(syncBookmarksForUser(admin, 'user-1')).rejects.toMatchObject({
      status: 403,
    });
  });

  it('propagates HttpError(500) from token-read failure', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(syncBookmarksForUser(admin, 'user-1')).rejects.toBeInstanceOf(
      HttpError,
    );
    await expect(syncBookmarksForUser(admin, 'user-1')).rejects.toMatchObject({
      status: 500,
    });
    consoleError.mockRestore();
  });
});
