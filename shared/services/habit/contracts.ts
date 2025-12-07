/**
 * Shared contracts for the Habits domain. This TypeScript module is the
 * canonical source of contract shapes and habit constants. CommonJS shims
 * re-export the compiled output generated via `tsc -p ./tsconfig.json` so
 * runtime consumers stay aligned without ts-node or duplicated literal arrays.
 */

import type { PaginationMeta } from '../contracts/pagination';

export const HABIT_PERIODS = ['day', 'week', 'month', 'year', 'all'] as const;
export type HabitPeriod = (typeof HABIT_PERIODS)[number];

// Metrics are the provider-level inputs; the service maps them onto the domain
// HabitStats fields so routes and UI never deal with raw provider names.
export const HABIT_METRICS = ['sum', 'avg', 'min', 'max', 'stddev'] as const;
export type HabitMetric = (typeof HABIT_METRICS)[number];

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
