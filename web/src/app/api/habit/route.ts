import { listHabitLogs } from '@/lib/habit/habitRepository';
import { requireHabitUserAndAdmin } from '@/lib/habit/routeContext';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const ctx = await requireHabitUserAndAdmin();
  if (!ctx.ok) {
    return ctx.response;
  }

  const { searchParams } = new URL(request.url);
  const result = await listHabitLogs(ctx.admin, ctx.userId, {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined,
  });

  if (!result) {
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
  return NextResponse.json(result);
}
