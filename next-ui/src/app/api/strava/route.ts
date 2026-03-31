import { NextResponse } from 'next/server';

// TODO: Replace with Supabase client query after DB migration
// Requires: strava_tokens, strava_activities tables in Supabase
// TODO: Determine auth mechanism (static token or Supabase auth)
// GET /api/strava - Get Strava activities
export async function GET() {
  return NextResponse.json(
    {
      error: 'Strava dashboard is temporarily unavailable during platform migration',
      code: 'MIGRATION_IN_PROGRESS',
    },
    { status: 503 }
  );
}
