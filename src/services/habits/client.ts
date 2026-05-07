import { readApiJson } from '@/lib/api/readApiJson';
import type {
  HabitDetail,
  HabitListParams,
  HabitListResult,
  HabitPeriod,
  HabitStats,
} from '@/lib/habit/contracts';

const API_BASE_URL = '/api';

export function createHabitClient(baseUrl = API_BASE_URL) {
  const base = baseUrl.replace(/\/$/, '');

  return {
    async getHabits(params?: HabitListParams): Promise<HabitListResult> {
      const search = new URLSearchParams();
      if (params?.page !== undefined) search.set('page', String(params.page));
      if (params?.pageSize !== undefined) search.set('pageSize', String(params.pageSize));
      const query = search.toString();
      const response = await fetch(`${base}/habit${query ? `?${query}` : ''}`, {
        credentials: 'include',
      });
      return readApiJson<HabitListResult>(response);
    },

    async getHabitById(id: string | number): Promise<HabitDetail | null> {
      const response = await fetch(`${base}/habit/entries/${id}`, { credentials: 'include' });
      if (response.status === 404) return null;
      return readApiJson<HabitDetail>(response);
    },

    async getStats(period: HabitPeriod): Promise<HabitStats> {
      const response = await fetch(`${base}/habit/stats/${period}`, { credentials: 'include' });
      return readApiJson<HabitStats>(response);
    },
  };
}

export const habitClient = createHabitClient();
export type HabitClient = ReturnType<typeof createHabitClient>;
