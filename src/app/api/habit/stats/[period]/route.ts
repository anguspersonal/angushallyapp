import { computeHabitStats } from '@/lib/habit/habitStats';
import { requireHabitUserAndAdmin } from '@/lib/habit/routeContext';
import { NextResponse } from 'next/server';

type Params = { period: string };

export async function GET(_request: Request, context: { params: Promise<Params> }) {
  const ctx = await requireHabitUserAndAdmin();
  if (!ctx.ok) {
    return ctx.response;
  }

  const { period } = await context.params;
  const out = await computeHabitStats(ctx.admin, ctx.userId, period);
  if (!out.ok) {
    return NextResponse.json({ error: 'Invalid stats request', code: out.code }, { status: out.status });
  }
  return NextResponse.json(out.stats);
}
