import { migrationInProgressResponse } from '@/lib/api/migrationUnavailable';

// TODO: Replace with Supabase client query after DB migration
// Requires: strava_tokens, strava_activities tables in Supabase
// TODO: Determine auth mechanism (static token or Supabase auth)
// GET /api/strava - Get Strava activities
export async function GET() {
  return migrationInProgressResponse('strava');
}
