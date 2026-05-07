import { HttpError, authedHandler } from '@/lib/api/handler';
import { listDrinkCatalog } from '@/lib/habit/habitRepository';

type Params = { habitType: string };

export const GET = authedHandler<Params>(async ({ admin, params }) => {
  if (params.habitType !== 'alcohol') {
    throw new HttpError(400, 'Invalid habit type');
  }
  return listDrinkCatalog(admin);
});
