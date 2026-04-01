import { migrationInProgressResponse } from '@/lib/api/migrationUnavailable';

// TODO: Replace with Supabase client query after DB migration
// GET /api/content/posts/:identifier - Get post by slug or ID
export async function GET() {
  return migrationInProgressResponse('blog');
}
