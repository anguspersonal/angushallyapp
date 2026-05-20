import { HttpError, authedHandler } from '@/lib/api/handler';
import { getHabitLogById } from '@/lib/habit/habitRepository';

type Params = { id: string };

export const GET = authedHandler<Params>(async ({ admin, userId, params }) => {
  const habit = await getHabitLogById(admin, userId, params.id);
  if (!habit) {
    throw new HttpError(404, 'Habit not found');
  }
  return habit;
});
