import { HttpError, authedHandler } from '@/lib/api/handler';
import {
  listStravaActivitiesForUser,
  userHasStravaTokens,
} from '@/lib/strava/stravaRepository';

export const GET = authedHandler(async ({ admin, userId }) => {
  const linked = await userHasStravaTokens(admin, userId);
  if (!linked) {
    throw new HttpError(403, 'Strava account not connected');
  }
  return listStravaActivitiesForUser(admin, userId);
});
