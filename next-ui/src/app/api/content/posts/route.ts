import { NextResponse } from 'next/server';

// TODO: Replace with Supabase client query after DB migration
// GET /api/content/posts - List all blog posts
export async function GET() {
  return NextResponse.json(
    {
      error: 'Blog content is temporarily unavailable during platform migration',
      code: 'MIGRATION_IN_PROGRESS',
    },
    { status: 503 }
  );
}
