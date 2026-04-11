import type { ContentListParams } from '@shared/services/content/contracts';

export function buildPostsQueryString(params?: ContentListParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize));
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.order) search.set('order', params.order);
  const query = search.toString();
  return query ? `?${query}` : '';
}
