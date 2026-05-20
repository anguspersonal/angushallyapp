import { HttpError, publicHandler } from '@/lib/api/handler';
import { getBlogPostDetail } from '@/lib/content/blogRepository';

type Params = { identifier: string };

export const GET = publicHandler<Params>(async ({ admin, params }) => {
  if (!admin) {
    throw new HttpError(503, 'Supabase not configured');
  }
  const post = await getBlogPostDetail(admin, decodeURIComponent(params.identifier));
  if (!post) {
    throw new HttpError(404, 'Post not found');
  }
  return post;
});
