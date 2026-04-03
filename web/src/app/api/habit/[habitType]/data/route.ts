import { listDrinkCatalog } from '@/lib/habit/habitRepository';
import { requireHabitUserAndAdmin } from '@/lib/habit/routeContext';
import { NextResponse } from 'next/server';

type Params = { habitType: string };

export async function GET(_request: Request, context: { params: Promise<Params> }) {
  const ctx = await requireHabitUserAndAdmin();
  if (!ctx.ok) {
    return ctx.response;
  }

  const { habitType } = await context.params;
  if (habitType !== 'alcohol') {
    return NextResponse.json({ error: 'Invalid habit type' }, { status: 400 });
  }

  const data = await listDrinkCatalog(ctx.admin);
  if (data === null) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
  return NextResponse.json(data);
}
