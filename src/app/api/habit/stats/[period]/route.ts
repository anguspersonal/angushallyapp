import { authedHandler } from '@/lib/api/handler';
import { computeHabitStats } from '@/lib/habit/habitStats';

type Params = { period: string };

export const GET = authedHandler<Params>(async ({ admin, userId, params }) =>
  computeHabitStats(admin, userId, params.period),
);
