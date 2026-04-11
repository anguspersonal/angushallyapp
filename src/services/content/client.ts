import type {
  ContentListParams,
  ContentListResult,
  ContentPostDetail,
  ContentPostSummary,
} from '@shared/services/content/contracts';
import { API_BASE } from '@/shared/apiClient';
import { buildPostsQueryString } from './buildPostsQueryString';
import { readContentJson } from './readContentJson';

export function createContentClient(baseUrl = API_BASE) {
  const base = baseUrl.replace(/\/$/, '');

  async function fetchPostDetail(encodedSegment: string): Promise<ContentPostDetail | null> {
    const response = await fetch(`${base}/content/posts/${encodedSegment}`, { credentials: 'include' });
    if (response.status === 404) return null;
    return readContentJson<ContentPostDetail>(response);
  }

  const getPosts = async (params?: ContentListParams): Promise<ContentListResult> => {
    const query = buildPostsQueryString(params);
    const response = await fetch(`${base}/content/posts${query}`, { credentials: 'include' });
    return readContentJson<ContentListResult>(response);
  };

  const getPostBySlug = async (slug: string): Promise<ContentPostDetail | null> => {
    if (!slug) return null;
    return fetchPostDetail(encodeURIComponent(slug));
  };

  return {
    getPosts,
    getPostBySlug,
    async getPostById(id: string | number): Promise<ContentPostDetail | null> {
      if (id === '' || id == null) return null;
      return fetchPostDetail(encodeURIComponent(String(id)));
    },
    async getLatestPost(): Promise<ContentPostSummary | null> {
      const result = await getPosts({ pageSize: 1, page: 1, sortBy: 'createdAt', order: 'desc' });
      return result.items[0] ?? null;
    },
  };
}

export type ContentClient = ReturnType<typeof createContentClient>;

export const contentClient = createContentClient();
