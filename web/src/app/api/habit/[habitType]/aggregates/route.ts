import { requireHabitUserAndAdmin } from '@/lib/habit/routeContext';
import { NextResponse } from 'next/server';

type Params = { habitType: string };

export async function GET(_request: Request, context: { params: Promise<Params> }) {
  const ctx = await requireHabitUserAndAdmin();
  if (!ctx.ok) {
    return ctx.response;
  }

  const { habitType: _habitType } = await context.params;

  return NextResponse.json(
    {
      error: 'Aggregate provider not yet ported to Next',
      code: 'HABIT_AGGREGATE_PROVIDER_MISSING',
    },
    { status: 501 },
  );
}
