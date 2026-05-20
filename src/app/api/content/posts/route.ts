import { HttpError, publicHandler } from '@/lib/api/handler';
import { listBlogPosts } from '@/lib/content/blogRepository';
import type { ContentListParams } from '@/lib/content/contracts';

export const GET = publicHandler(async ({ admin, req }) => {
  if (!admin) {
    throw new HttpError(503, 'Supabase not configured');
  }
  const { searchParams } = new URL(req.url);
  const params: ContentListParams = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined,
    sortBy: (searchParams.get('sortBy') as ContentListParams['sortBy']) ?? undefined,
    order: (searchParams.get('order') as ContentListParams['order']) ?? undefined,
  };
  return listBlogPosts(admin, params);
});
