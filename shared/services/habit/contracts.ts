/**
 * Shared contracts for the Habits domain. These mirror the content service
 * pattern so the migration path is clear even while the implementation is
 * stubbed.
 */

import type { PaginationMeta } from '../contracts/pagination';

export type HabitPeriod = 'day' | 'week' | 'month' | 'year' | 'all';
export const HABIT_PERIODS: HabitPeriod[] = ['day', 'week', 'month', 'year', 'all'];

// Metrics are the provider-level inputs; the service maps them onto the domain
// HabitStats fields so routes and UI never deal with raw provider names.
export type HabitMetric = 'sum' | 'avg' | 'min' | 'max' | 'stddev';
export const HABIT_METRICS: HabitMetric[] = ['sum', 'avg', 'min', 'max', 'stddev'];

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

export interface HabitStats {
  period: HabitPeriod;
  totalCompleted: number;
  averagePerEntry: number;
  minimumPerEntry: number;
  maximumPerEntry: number;
  standardDeviation: number;
}
