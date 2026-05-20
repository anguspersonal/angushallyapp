import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import {
  getHabitLogById,
  insertHabitLog,
  listDrinkCatalog,
  listHabitLogs,
} from './habitRepository';

interface StubResult {
  data?: unknown;
  error?: unknown;
  count?: number | null;
}

// Minimal Supabase fluent-builder stub: every chain method returns the stub
// itself, and `await stub` (or `await stub.maybeSingle()` etc) resolves to the
// configured `{ data, error, count }`. Sufficient for any chain shape today.
function supabaseStub(result: StubResult): SupabaseClient {
  const stub: Record<string, unknown> = {
    then: (resolve: (v: StubResult) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
  for (const m of [
    'schema', 'from', 'select', 'eq', 'in', 'order', 'gte', 'limit',
    'range', 'insert', 'upsert', 'update', 'single', 'maybeSingle',
  ]) {
    stub[m] = vi.fn(() => stub);
  }
  return stub as unknown as SupabaseClient;
}

describe('listHabitLogs', () => {
  it('returns shaped list result on success', async () => {
    const admin = supabaseStub({
      data: [
        { id: 1, habit_type: 'exercise', metric: 'min', created_at: '2026-05-06' },
      ],
      error: null,
      count: 1,
    });
    const result = await listHabitLogs(admin, 'user-1');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ id: 1, name: 'exercise', cadence: 'min' });
    expect(result.pagination).toMatchObject({ totalItems: 1, page: 1 });
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(listHabitLogs(admin, 'user-1')).rejects.toBeInstanceOf(HttpError);
    await expect(listHabitLogs(admin, 'user-1')).rejects.toMatchObject({ status: 500 });
    consoleError.mockRestore();
  });
});

describe('getHabitLogById', () => {
  it('returns null when row is missing (legitimate not-found, not an error)', async () => {
    const admin = supabaseStub({ data: null, error: null });
    expect(await getHabitLogById(admin, 'user-1', '1')).toBeNull();
  });

  it('returns shaped detail when row exists', async () => {
    const admin = supabaseStub({
      data: {
        id: 1,
        habit_type: 'exercise',
        metric: 'min',
        created_at: '2026-05-06',
        extra_data: { notes: 'good run' },
      },
      error: null,
    });
    const result = await getHabitLogById(admin, 'user-1', '1');
    expect(result).toMatchObject({ id: 1, name: 'exercise', description: 'good run' });
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(getHabitLogById(admin, 'user-1', '1')).rejects.toMatchObject({
      status: 500,
    });
    consoleError.mockRestore();
  });
});

describe('insertHabitLog', () => {
  it('returns inserted row id on success', async () => {
    const admin = supabaseStub({ data: { id: 42 }, error: null });
    expect(await insertHabitLog(admin, 'user-1', 'exercise', 30, 'min', {})).toBe(42);
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(
      insertHabitLog(admin, 'user-1', 'exercise', 30, 'min', {}),
    ).rejects.toMatchObject({ status: 500 });
    consoleError.mockRestore();
  });

  it('throws HttpError(500) when insert returns no id', async () => {
    const admin = supabaseStub({ data: null, error: null });
    await expect(
      insertHabitLog(admin, 'user-1', 'exercise', 30, 'min', {}),
    ).rejects.toBeInstanceOf(HttpError);
  });
});

describe('listDrinkCatalog', () => {
  it('returns rows on success', async () => {
    const admin = supabaseStub({ data: [{ name: 'beer' }], error: null });
    expect(await listDrinkCatalog(admin)).toEqual([{ name: 'beer' }]);
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(listDrinkCatalog(admin)).rejects.toMatchObject({ status: 500 });
    consoleError.mockRestore();
  });
});
