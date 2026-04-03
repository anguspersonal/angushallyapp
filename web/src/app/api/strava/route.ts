import { migrationInProgressResponse } from '@/lib/api/migrationUnavailable';
import { listStravaActivitiesForUser, userHasStravaTokens } from '@/lib/strava/stravaRepository';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const userClient = await createSupabaseServerClient();
  if (!userClient) {
    return migrationInProgressResponse('strava');
  }

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return migrationInProgressResponse('strava');
  }

  const linked = await userHasStravaTokens(admin, user.id);
  if (!linked) {
    return NextResponse.json({ error: 'Strava account not connected' }, { status: 403 });
  }

  const activities = await listStravaActivitiesForUser(admin, user.id);
  if (activities === null) {
    return migrationInProgressResponse('strava');
  }

  return NextResponse.json(activities);
}
