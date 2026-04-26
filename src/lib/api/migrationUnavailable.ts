import { NextResponse } from 'next/server';

const MESSAGES = {
  strava: 'Strava dashboard is temporarily unavailable during platform migration',
  blog: 'Blog content is temporarily unavailable during platform migration',
  habit: 'Habit API is temporarily unavailable. Configure Supabase or sign in.',
} as const;

export type MigrationUnavailableFeature = keyof typeof MESSAGES;

export function migrationInProgressResponse(feature: MigrationUnavailableFeature): NextResponse {
  return NextResponse.json(
    { error: MESSAGES[feature], code: 'MIGRATION_IN_PROGRESS' },
    { status: 503 }
  );
}
