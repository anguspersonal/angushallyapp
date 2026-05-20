import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';

export async function listStravaActivitiesForUser(
  admin: SupabaseClient,
  userId: string,
): Promise<Record<string, unknown>[]> {
  const { data, error } = await admin
    .schema('habit')
    .from('strava_activities')
    .select('*')
    .eq('user_id', userId)
    .order('start_date_local', { ascending: false });

  if (error) {
    console.error('[strava] listStravaActivitiesForUser', error);
    throw new HttpError(500, 'Failed to fetch Strava activities');
  }
  return data ?? [];
}

export async function userHasStravaTokens(
  admin: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .schema('habit')
    .from('strava_tokens')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[strava] userHasStravaTokens', error);
    throw new HttpError(500, 'Failed to check Strava connection');
  }
  return data != null;
}
