import { migrationInProgressResponse } from '@/lib/api/migrationUnavailable';

// TODO: Replace with Supabase client query after DB migration
// GET /api/content/posts - List all blog posts
export async function GET() {
  return migrationInProgressResponse('blog');
}
