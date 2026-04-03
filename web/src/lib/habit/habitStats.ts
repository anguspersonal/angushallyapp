import type { SupabaseClient } from '@supabase/supabase-js';
import type { HabitMetric, HabitPeriod, HabitStats } from '../../../../shared/services/habit/contracts.ts';

/** Mirrors `shared/services/habit/contracts.ts` — avoid CJS shim (`contracts.js` → missing dist) in the Next bundle. */
const HABIT_PERIODS = ['day', 'week', 'month', 'year', 'all'] as const;
const HABIT_METRICS = ['sum', 'avg', 'min', 'max', 'stddev'] as const;

const METRIC_TO_FIELD: Record<HabitMetric, keyof HabitStats> = {
  sum: 'totalCompleted',
  avg: 'averagePerEntry',
  min: 'minimumPerEntry',
  max: 'maximumPerEntry',
  stddev: 'standardDeviation',
};

function startOfPeriodUtc(period: HabitPeriod): Date | null {
  const now = new Date();
  if (period === 'all') return null;
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  if (period === 'day') return d;
  if (period === 'week') {
    const day = d.getUTCDay();
    d.setUTCDate(d.getUTCDate() - day);
    return d;
  }
  if (period === 'month') {
    d.setUTCDate(1);
    return d;
  }
  if (period === 'year') {
    d.setUTCMonth(0, 1);
    return d;
  }
  return d;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const sq = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(sq);
}

export async function computeHabitStats(
  admin: SupabaseClient,
  userId: string,
  period: string,
  metrics: HabitMetric[] = [...HABIT_METRICS],
): Promise<{ ok: true; stats: HabitStats } | { ok: false; code: string; status: number }> {
  if (!(HABIT_PERIODS as readonly string[]).includes(period)) {
    return { ok: false, code: 'HABIT_INVALID_PERIOD', status: 400 };
  }
  const p = period as HabitPeriod;
  const invalidMetrics = metrics.filter((m) => !(HABIT_METRICS as readonly string[]).includes(m));
  if (invalidMetrics.length > 0) {
    return { ok: false, code: 'HABIT_INVALID_METRIC', status: 400 };
  }

  const start = startOfPeriodUtc(p);
  let q = admin
    .schema('habit')
    .from('habit_log')
    .select('value')
    .eq('user_id', userId);
  if (start) {
    q = q.gte('created_at', start.toISOString());
  }

  const { data, error } = await q;
  if (error) {
    console.error('[habit] computeHabitStats', error);
    return { ok: false, code: 'HABIT_STATS_FETCH_FAILED', status: 500 };
  }

  const values = (data ?? [])
    .map((row) => Number(row.value))
    .filter((n) => Number.isFinite(n));

  const raw = {
    sum: values.reduce((a, b) => a + b, 0),
    avg: mean(values),
    min: values.length ? Math.min(...values) : 0,
    max: values.length ? Math.max(...values) : 0,
    stddev: stddev(values),
  };

  const shaped: HabitStats = {
    period: p,
    totalCompleted: 0,
    averagePerEntry: 0,
    minimumPerEntry: 0,
    maximumPerEntry: 0,
    standardDeviation: 0,
  };

  for (const metric of HABIT_METRICS) {
    const field = METRIC_TO_FIELD[metric];
    shaped[field] = raw[metric];
  }

  return { ok: true, stats: shaped };
}
