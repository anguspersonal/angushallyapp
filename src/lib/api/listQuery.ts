/**
 * Pagination + sort + clamp + error handling for Repository list queries.
 *
 * The caller provides a Supabase query already filtered to the right rows
 * (`.schema(...).from(...).select(*, { count: 'exact' }).eq(...)`); this
 * helper applies `.order()` + `.range()`, awaits the result, throws
 * HttpError(500) on Supabase error, and returns `{ rows, pagination }`. The
 * caller maps rows → items in its own domain shape.
 */

import { HttpError } from './httpError';
import type { PaginationMeta } from '@/lib/contracts/pagination';

export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface ListQueryConfig {
  /** Maps public sort aliases (e.g. "createdAt") to DB columns ("created_at"). */
  sortAllowlist?: Record<string, string>;
  /** DB column used when `sortBy` is missing or not in the allowlist. */
  defaultSortColumn: string;
  /** Default direction when `order` is missing. */
  defaultAscending?: boolean;
  /** Domain label used in error messages and console.error tags. */
  errorContext: string;
}

interface PaginatableQuery<TRow> {
  order(
    column: string,
    options: { ascending: boolean },
  ): PaginatableQuery<TRow>;
  range(
    from: number,
    to: number,
  ): PromiseLike<{
    data: TRow[] | null;
    error: { message: string } | null;
    count: number | null;
  }>;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function clampPageSize(value: number | undefined): number {
  const parsed = parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(parsed, MAX_PAGE_SIZE);
}

function clampPage(value: number | undefined): number {
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE;
}

function resolveSortColumn(
  sortBy: string | undefined,
  config: ListQueryConfig,
): string {
  if (sortBy && config.sortAllowlist?.[sortBy]) {
    return config.sortAllowlist[sortBy];
  }
  return config.defaultSortColumn;
}

export async function listPaginated<TRow>(
  query: PaginatableQuery<TRow>,
  params: ListQueryParams,
  config: ListQueryConfig,
): Promise<{ rows: TRow[]; pagination: PaginationMeta }> {
  const page = clampPage(params.page);
  const pageSize = clampPageSize(params.pageSize);
  const offset = (page - 1) * pageSize;
  const sortColumn = resolveSortColumn(params.sortBy, config);
  const ascending = params.order
    ? params.order === 'asc'
    : (config.defaultAscending ?? false);

  const { data, error, count } = await query
    .order(sortColumn, { ascending })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error(`[${config.errorContext}] listPaginated`, error);
    throw new HttpError(500, `Failed to list ${config.errorContext}`);
  }

  const rows = data ?? [];
  const totalItems = typeof count === 'number' ? count : rows.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasMore = page < totalPages;

  return {
    rows,
    pagination: { page, pageSize, totalItems, totalPages, hasMore },
  };
}
