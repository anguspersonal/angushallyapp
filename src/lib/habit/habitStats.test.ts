import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import { computeHabitStats } from './habitStats';

interface StubResult {
  data?: unknown;
  error?: unknown;
}

function supabaseStub(result: StubResult): SupabaseClient {
  const stub: Record<string, unknown> = {
    then: (resolve: (v: StubResult) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
  for (const m of ['schema', 'from', 'select', 'eq', 'gte']) {
    stub[m] = vi.fn(() => stub);
  }
  return stub as unknown as SupabaseClient;
}

describe('computeHabitStats', () => {
  it('throws HttpError(400) with code for invalid period', async () => {
    const admin = supabaseStub({ data: [], error: null });
    await expect(computeHabitStats(admin, 'user-1', 'fortnight')).rejects.toMatchObject({
      status: 400,
      code: 'HABIT_INVALID_PERIOD',
    });
  });

  it('throws HttpError(400) with code for invalid metric', async () => {
    const admin = supabaseStub({ data: [], error: null });
    await expect(
      computeHabitStats(admin, 'user-1', 'day', ['banana' as never]),
    ).rejects.toMatchObject({
      status: 400,
      code: 'HABIT_INVALID_METRIC',
    });
  });

  it('throws HttpError(500) with code on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(computeHabitStats(admin, 'user-1', 'day')).rejects.toMatchObject({
      status: 500,
      code: 'HABIT_STATS_FETCH_FAILED',
    });
    consoleError.mockRestore();
  });

  it('returns shaped stats on success', async () => {
    const admin = supabaseStub({
      data: [{ value: 2 }, { value: 4 }, { value: 6 }],
      error: null,
    });
    const stats = await computeHabitStats(admin, 'user-1', 'all');
    expect(stats).toMatchObject({
      period: 'all',
      totalCompleted: 12,
      averagePerEntry: 4,
      minimumPerEntry: 2,
      maximumPerEntry: 6,
    });
    expect(stats.standardDeviation).toBeGreaterThan(0);
  });

  it('returns zeroed stats when no rows match the period', async () => {
    const admin = supabaseStub({ data: [], error: null });
    const stats = await computeHabitStats(admin, 'user-1', 'day');
    expect(stats).toMatchObject({
      period: 'day',
      totalCompleted: 0,
      averagePerEntry: 0,
      minimumPerEntry: 0,
      maximumPerEntry: 0,
      standardDeviation: 0,
    });
  });
});

describe('HttpError instance shape', () => {
  it('rejection is an HttpError (proper class, not a tagged Error)', async () => {
    const admin = supabaseStub({ data: [], error: null });
    await expect(computeHabitStats(admin, 'user-1', 'fortnight')).rejects.toBeInstanceOf(
      HttpError,
    );
  });
});
