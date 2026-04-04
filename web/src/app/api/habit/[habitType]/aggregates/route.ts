import { requireHabitUserAndAdmin } from '@/lib/habit/routeContext';
import { NextResponse } from 'next/server';

type Params = { habitType: string };

export async function GET(_request: Request, context: { params: Promise<Params> }) {
  const ctx = await requireHabitUserAndAdmin();
  if (!ctx.ok) return ctx.response;

  const { habitType } = await context.params;
  if (!['alcohol', 'exercise'].includes(habitType)) {
    return NextResponse.json({ error: 'Invalid habit type' }, { status: 400 });
  }

  // Fetch all logs for this habit type and compute aggregates
  const { data, error } = await ctx.admin
    .schema('habit')
    .from('habit_log')
    .select('value, metric, created_at')
    .eq('user_id', ctx.userId)
    .eq('habit_type', habitType)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[habit] aggregates', error);
    return NextResponse.json({ error: 'Failed to fetch aggregates' }, { status: 500 });
  }

  const rows = data ?? [];
  const values = rows
    .map((r) => Number(r.value))
    .filter((n) => Number.isFinite(n));

  const total = values.reduce((a, b) => a + b, 0);
  const avg = values.length ? total / values.length : 0;

  return NextResponse.json({
    habitType,
    aggregates: {
      totalEntries: rows.length,
      totalValue: total,
      averageValue: Math.round(avg * 100) / 100,
      minValue: values.length ? Math.min(...values) : 0,
      maxValue: values.length ? Math.max(...values) : 0,
      firstEntry: rows.length ? rows[rows.length - 1].created_at : null,
      lastEntry: rows.length ? rows[0].created_at : null,
    },
  });
}
