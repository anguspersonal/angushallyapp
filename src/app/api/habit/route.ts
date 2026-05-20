import { authedHandler } from '@/lib/api/handler';
import { listHabitLogs } from '@/lib/habit/habitRepository';

export const GET = authedHandler(async ({ admin, userId, req }) => {
  const { searchParams } = new URL(req.url);
  return listHabitLogs(admin, userId, {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined,
  });
});
