import { getBlogPostDetail } from '@/lib/content/blogRepository';
import { migrationInProgressResponse } from '@/lib/api/migrationUnavailable';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

type Params = { identifier: string };

export async function GET(_request: Request, context: { params: Promise<Params> }) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return migrationInProgressResponse('blog');
  }

  const { identifier } = await context.params;
  const post = await getBlogPostDetail(admin, decodeURIComponent(identifier));
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json(post);
}
