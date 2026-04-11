import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Strava sync — refresh access tokens, fetch new activities, upsert to Supabase.
 *
 * Called by:
 *   - POST /api/strava/sync (Vercel Cron, daily)
 *
 * Schema: habit.strava_tokens, habit.strava_activities, habit.strava_sync_log
 */

// Strava access tokens live ~6 hours; refresh tokens are long-lived.
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_ACTIVITIES_URL = 'https://www.strava.com/api/v3/athlete/activities';
// Refresh early so a long-running sync doesn't race the expiry.
const EXPIRY_BUFFER_SECONDS = 60;

interface StravaTokenRow {
  id: number;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user_id: string;
}

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  average_speed: number;
  max_speed: number;
  elev_high?: number;
  elev_low?: number;
  map?: { id?: string; summary_polyline?: string };
  workout_type?: number;
  utc_offset?: number;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  achievement_count?: number;
  kudos_count?: number;
  comment_count?: number;
  athlete_count?: number;
  photo_count?: number;
  trainer?: boolean;
  commute?: boolean;
  manual?: boolean;
  private?: boolean;
  visibility?: string;
  flagged?: boolean;
  gear_id?: string | null;
  start_latlng?: [number, number] | null;
  end_latlng?: [number, number] | null;
  upload_id?: number;
  external_id?: string | null;
  from_accepted_tag?: boolean;
  pr_count?: number;
  total_photo_count?: number;
  has_kudoed?: boolean;
}

export interface SyncResult {
  userId: string;
  tokenRefreshed: boolean;
  activitiesFetched: number;
  activitiesUpserted: number;
  error?: string;
}

/**
 * Refresh a user's Strava access token if it is expired or about to expire.
 * Mutates the `strava_tokens` row and returns the current access token.
 */
async function ensureFreshAccessToken(
  admin: SupabaseClient,
  tokenRow: StravaTokenRow,
): Promise<{ accessToken: string; refreshed: boolean }> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (tokenRow.expires_at > nowSeconds + EXPIRY_BUFFER_SECONDS) {
    return { accessToken: tokenRow.access_token, refreshed: false };
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET not set');
  }

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: tokenRow.refresh_token,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Strava token refresh failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };

  const { error } = await admin
    .schema('habit')
    .from('strava_tokens')
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    })
    .eq('user_id', tokenRow.user_id);

  if (error) {
    throw new Error(`Failed to persist refreshed token: ${error.message}`);
  }

  return { accessToken: data.access_token, refreshed: true };
}

/**
 * Fetch activities from Strava for a user, filtered to those newer than `afterUnix`.
 * Strava paginates with `?page=N&per_page=200` — one page is plenty for a daily sync.
 */
async function fetchActivitiesSince(
  accessToken: string,
  afterUnix: number,
): Promise<StravaActivity[]> {
  const url = `${STRAVA_ACTIVITIES_URL}?after=${afterUnix}&per_page=200&page=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Strava activities fetch failed (${res.status}): ${body}`);
  }

  return (await res.json()) as StravaActivity[];
}

/**
 * Find the most recent activity `start_date` we already have for this user,
 * so we only fetch what's new. Returns 0 (epoch) if the user has no activities yet.
 */
async function getLatestActivityUnixTimestamp(
  admin: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data, error } = await admin
    .schema('habit')
    .from('strava_activities')
    .select('start_date')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[strava/sync] getLatestActivityUnixTimestamp', error);
    return 0;
  }
  if (!data?.start_date) return 0;

  return Math.floor(new Date(data.start_date as string).getTime() / 1000);
}

function mapActivityToRow(activity: StravaActivity, userId: string) {
  return {
    id: activity.id,
    user_id: userId,
    name: activity.name,
    distance: activity.distance,
    moving_time: activity.moving_time,
    elapsed_time: activity.elapsed_time,
    total_elevation_gain: activity.total_elevation_gain,
    type: activity.type,
    sport_type: activity.sport_type,
    start_date: activity.start_date,
    start_date_local: activity.start_date_local,
    timezone: activity.timezone,
    average_speed: activity.average_speed,
    max_speed: activity.max_speed,
    elev_high: activity.elev_high ?? null,
    elev_low: activity.elev_low ?? null,
    map_id: activity.map?.id ?? null,
    summary_polyline: activity.map?.summary_polyline ?? null,
    workout_type: activity.workout_type ?? null,
    utc_offset: activity.utc_offset ?? null,
    location_city: activity.location_city ?? null,
    location_state: activity.location_state ?? null,
    location_country: activity.location_country ?? null,
    achievement_count: activity.achievement_count ?? null,
    kudos_count: activity.kudos_count ?? null,
    comment_count: activity.comment_count ?? null,
    athlete_count: activity.athlete_count ?? null,
    photo_count: activity.photo_count ?? null,
    trainer: activity.trainer ?? null,
    commute: activity.commute ?? null,
    manual: activity.manual ?? null,
    private: activity.private ?? null,
    visibility: activity.visibility ?? null,
    flagged: activity.flagged ?? null,
    gear_id: activity.gear_id ?? null,
    start_lat: activity.start_latlng?.[0] ?? null,
    start_lng: activity.start_latlng?.[1] ?? null,
    end_lat: activity.end_latlng?.[0] ?? null,
    end_lng: activity.end_latlng?.[1] ?? null,
    upload_id: activity.upload_id ?? null,
    external_id: activity.external_id ?? null,
    from_accepted_tag: activity.from_accepted_tag ?? null,
    pr_count: activity.pr_count ?? null,
    total_photo_count: activity.total_photo_count ?? null,
    has_kudoed: activity.has_kudoed ?? null,
  };
}

/** Sync Strava activities for a single user. Throws on unrecoverable errors. */
export async function syncStravaForUser(
  admin: SupabaseClient,
  tokenRow: StravaTokenRow,
): Promise<SyncResult> {
  const { accessToken, refreshed } = await ensureFreshAccessToken(admin, tokenRow);
  const since = await getLatestActivityUnixTimestamp(admin, tokenRow.user_id);
  const activities = await fetchActivitiesSince(accessToken, since);

  let upserted = 0;
  if (activities.length > 0) {
    const rows = activities.map((a) => mapActivityToRow(a, tokenRow.user_id));
    const { error } = await admin
      .schema('habit')
      .from('strava_activities')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to upsert activities: ${error.message}`);
    }
    upserted = rows.length;
  }

  // Write a sync log row regardless of whether anything new arrived.
  await admin
    .schema('habit')
    .from('strava_sync_log')
    .insert({ user_id: tokenRow.user_id });

  return {
    userId: tokenRow.user_id,
    tokenRefreshed: refreshed,
    activitiesFetched: activities.length,
    activitiesUpserted: upserted,
  };
}

/** Sync Strava activities for every user with a token row. */
export async function syncStravaForAllUsers(
  admin: SupabaseClient,
): Promise<SyncResult[]> {
  const { data: tokenRows, error } = await admin
    .schema('habit')
    .from('strava_tokens')
    .select('id, access_token, refresh_token, expires_at, user_id');

  if (error) {
    throw new Error(`Failed to load strava_tokens: ${error.message}`);
  }
  if (!tokenRows || tokenRows.length === 0) {
    return [];
  }

  const results: SyncResult[] = [];
  for (const row of tokenRows as StravaTokenRow[]) {
    try {
      results.push(await syncStravaForUser(admin, row));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[strava/sync] user ${row.user_id} failed:`, message);
      results.push({
        userId: row.user_id,
        tokenRefreshed: false,
        activitiesFetched: 0,
        activitiesUpserted: 0,
        error: message,
      });
    }
  }
  return results;
}
