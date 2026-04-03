import type {
  HabitDetail,
  HabitListParams,
  HabitListResult,
  HabitPeriod,
  HabitStats,
} from '@shared/services/habit/contracts';

const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer
  ? process.env.API_BASE_URL || 'http://localhost:5000/api'
  : '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'error' in payload
      ? /** @type {{ error?: string }} */ (payload).error
      : typeof payload === 'string'
        ? payload
        : `Request failed with status ${response.status}`;
    const error = new Error(message || 'Request failed');
    // @ts-expect-error adding code for hooks consumers
    error.code = typeof payload === 'object' && payload !== null && 'code' in payload
      ? /** @type {{ code?: string }} */ (payload).code
      : response.status === 404
        ? 'NOT_FOUND'
        : 'HTTP_ERROR';
    throw error;
  }

  return (payload as T) ?? (await response.json());
}

export function createHabitClient(baseUrl = API_BASE_URL) {
  const base = baseUrl.replace(/\/$/, '');

  return {
    async getHabits(params?: HabitListParams): Promise<HabitListResult> {
      const search = new URLSearchParams();
      if (params?.page !== undefined) search.set('page', String(params.page));
      if (params?.pageSize !== undefined) search.set('pageSize', String(params.pageSize));
      const query = search.toString();
      const response = await fetch(`${base}/habit${query ? `?${query}` : ''}`, { credentials: 'include' });
      return handleResponse<HabitListResult>(response);
    },
    async getHabitById(id: string | number): Promise<HabitDetail | null> {
      const response = await fetch(`${base}/habit/entries/${id}`, { credentials: 'include' });
      if (response.status === 404) return null;
      return handleResponse<HabitDetail>(response);
    },
    async getStats(period: HabitPeriod): Promise<HabitStats> {
      const response = await fetch(`${base}/habit/stats/${period}`, { credentials: 'include' });
      return handleResponse<HabitStats>(response);
    },
  };
}

export const habitClient = createHabitClient();
export type HabitClient = ReturnType<typeof createHabitClient>;
