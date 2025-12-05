import type {
  ContentListParams,
  ContentListResult,
  ContentPostDetail,
  ContentPostSummary,
} from '@shared/services/content/contracts';

const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer
  ? process.env.API_BASE_URL || 'http://localhost:5000/api'
  : '/api';

function buildQuery(params?: ContentListParams) {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize));
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.order) search.set('order', params.order);
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || `Request failed with status ${response.status}`);
    // @ts-expect-error augmenting error for hooks
    error.code = response.status === 404 ? 'NOT_FOUND' : 'HTTP_ERROR';
    throw error;
  }
  return response.json();
}

export function createContentClient(baseUrl = API_BASE_URL) {
  const base = baseUrl.replace(/\/$/, '');

  const getPosts = async (params?: ContentListParams): Promise<ContentListResult> => {
    const query = buildQuery(params);
    const response = await fetch(`${base}/content/posts${query}`, { credentials: 'include' });
    return handleResponse<ContentListResult>(response);
  };

  const getPostBySlug = async (slug: string): Promise<ContentPostDetail | null> => {
    if (!slug) return null;
    const response = await fetch(`${base}/content/posts/${slug}`, { credentials: 'include' });
    if (response.status === 404) return null;
    return handleResponse<ContentPostDetail>(response);
  };

  return {
    getPosts,
    getPostBySlug,
    async getPostById(id: string | number): Promise<ContentPostDetail | null> {
      if (!id) return null;
      const response = await fetch(`${base}/content/posts/${id}`, { credentials: 'include' });
      if (response.status === 404) return null;
      return handleResponse<ContentPostDetail>(response);
    },
    async getLatestPost(): Promise<ContentPostSummary | null> {
      const result = await getPosts({ pageSize: 1, page: 1, sortBy: 'createdAt', order: 'desc' });
      return result.items[0] ?? null;
    },
  };
}

export type ContentClient = ReturnType<typeof createContentClient>;

export const contentClient = createContentClient();
