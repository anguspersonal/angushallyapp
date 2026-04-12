import type { ContentListParams } from '@/lib/content/contracts';
import { listBlogPosts } from '@/lib/content/blogRepository';
import { migrationInProgressResponse } from '@/lib/api/migrationUnavailable';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return migrationInProgressResponse('blog');
  }

  const { searchParams } = new URL(request.url);
  const params: ContentListParams = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined,
    sortBy: (searchParams.get('sortBy') as ContentListParams['sortBy']) ?? undefined,
    order: (searchParams.get('order') as ContentListParams['order']) ?? undefined,
  };

  const result = await listBlogPosts(admin, params);
  if (!result) {
    return migrationInProgressResponse('blog');
  }
  return NextResponse.json(result);
}
