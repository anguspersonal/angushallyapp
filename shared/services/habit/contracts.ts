/**
 * Shared contracts for the Habits domain. These mirror the content service
 * pattern so the migration path is clear even while the implementation is
 * stubbed.
 */

import type { PaginationMeta } from '../contracts/pagination';

export type HabitPeriod = 'day' | 'week' | 'month' | 'year' | 'all';
export type HabitMetric = 'sum' | 'avg' | 'min' | 'max' | 'stddev';

export interface HabitListParams {
  page?: number;
  pageSize?: number;
}

export interface HabitSummary {
  id: string | number;
  name: string;
  cadence?: string | null;
  lastLoggedAt?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

export interface HabitDetail extends HabitSummary {
  description?: string | null;
  lastCompletedAt?: string | null;
}

export interface HabitListResult {
  items: HabitSummary[];
  pagination: PaginationMeta;
}

export interface HabitStats extends Partial<Record<HabitMetric, number>> {
  period: HabitPeriod;
}
