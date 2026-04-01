import type {
  ContentListParams,
  ContentListResult,
  ContentPostDetail,
  ContentPostSummary,
} from '@shared/services/content/contracts';
import { buildPostsQueryString } from './buildPostsQueryString';
import { readContentJson } from './readContentJson';

const API_BASE_URL = '/api';

export function createContentClient(baseUrl = API_BASE_URL) {
  const base = baseUrl.replace(/\/$/, '');

  const getPosts = async (params?: ContentListParams): Promise<ContentListResult> => {
    const query = buildPostsQueryString(params);
    const response = await fetch(`${base}/content/posts${query}`, { credentials: 'include' });
    return readContentJson<ContentListResult>(response);
  };

  const getPostBySlug = async (slug: string): Promise<ContentPostDetail | null> => {
    if (!slug) return null;
    const response = await fetch(`${base}/content/posts/${slug}`, { credentials: 'include' });
    if (response.status === 404) return null;
    return readContentJson<ContentPostDetail>(response);
  };

  return {
    getPosts,
    getPostBySlug,
    async getPostById(id: string | number): Promise<ContentPostDetail | null> {
      if (!id) return null;
      const response = await fetch(`${base}/content/posts/${id}`, { credentials: 'include' });
      if (response.status === 404) return null;
      return readContentJson<ContentPostDetail>(response);
    },
    async getLatestPost(): Promise<ContentPostSummary | null> {
      const result = await getPosts({ pageSize: 1, page: 1, sortBy: 'createdAt', order: 'desc' });
      return result.items[0] ?? null;
    },
  };
}

export type ContentClient = ReturnType<typeof createContentClient>;

export const contentClient = createContentClient();
