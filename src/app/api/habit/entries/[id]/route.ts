import { getHabitLogById } from '@/lib/habit/habitRepository';
import { requireHabitUserAndAdmin } from '@/lib/habit/routeContext';
import { NextResponse } from 'next/server';

type Params = { id: string };

export async function GET(_request: Request, context: { params: Promise<Params> }) {
  const ctx = await requireHabitUserAndAdmin();
  if (!ctx.ok) {
    return ctx.response;
  }

  const { id } = await context.params;
  const habit = await getHabitLogById(ctx.admin, ctx.userId, id);
  if (!habit) {
    return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
  }
  return NextResponse.json(habit);
}
