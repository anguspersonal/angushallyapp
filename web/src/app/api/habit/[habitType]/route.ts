import { insertHabitLog } from '@/lib/habit/habitRepository';
import { requireHabitUserAndAdmin } from '@/lib/habit/routeContext';
import { NextResponse } from 'next/server';

type Params = { habitType: string };

export async function POST(request: Request, context: { params: Promise<Params> }) {
  const ctx = await requireHabitUserAndAdmin();
  if (!ctx.ok) {
    return ctx.response;
  }

  const { habitType } = await context.params;
  if (!['alcohol', 'exercise'].includes(habitType)) {
    return NextResponse.json({ error: 'Invalid habit type' }, { status: 400 });
  }

  let body: { value?: number; metric?: string; extraData?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (
    habitType === 'alcohol' &&
    body.extraData &&
    Array.isArray((body.extraData as { drinks?: unknown }).drinks)
  ) {
    return NextResponse.json(
      {
        error: 'Alcohol multi-drink logging is not yet ported to Next — use simple value/metric or Express locally',
        code: 'HABIT_ALCOHOL_EXTENSION_NOT_PORTED',
      },
      { status: 501 },
    );
  }

  const logId = await insertHabitLog(
    ctx.admin,
    ctx.userId,
    habitType,
    body.value ?? null,
    body.metric ?? null,
    body.extraData ?? {},
  );

  if (logId === null) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Habit logged successfully', logId });
}
