import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  HabitDetail,
  HabitListParams,
  HabitListResult,
  HabitSummary,
} from '@shared/services/habit/contracts';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function clampPageSize(value?: number): number {
  const parsed = parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(parsed, MAX_PAGE_SIZE);
}

function parsePage(value?: number): number {
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE;
}

function mapHabitLog(log: Record<string, unknown>): HabitSummary {
  return {
    id: log.id as string | number,
    name: String(log.habit_type ?? ''),
    cadence: (log.metric as string) ?? null,
    lastLoggedAt: log.created_at ? String(log.created_at) : null,
    publishedAt: log.published_at ? String(log.published_at) : null,
    updatedAt: log.updated_at ? String(log.updated_at) : null,
  };
}

export async function listHabitLogs(
  admin: SupabaseClient,
  userId: string,
  params: HabitListParams = {},
): Promise<HabitListResult | null> {
  const page = parsePage(params.page);
  const pageSize = clampPageSize(params.pageSize);
  const offset = (page - 1) * pageSize;

  const base = admin
    .schema('habit')
    .from('habit_log')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const { data: rows, error, count } = await base.range(offset, offset + pageSize - 1);
  if (error) {
    console.error('[habit] listHabitLogs', error);
    return null;
  }

  const items = (rows ?? []).map((r) => mapHabitLog(r as Record<string, unknown>));
  const total = typeof count === 'number' ? count : items.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const hasMore = page < totalPages;

  return {
    items,
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages,
      hasMore,
    },
  };
}

export async function getHabitLogById(
  admin: SupabaseClient,
  userId: string,
  id: string,
): Promise<HabitDetail | null> {
  const { data: log, error } = await admin
    .schema('habit')
    .from('habit_log')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[habit] getHabitLogById', error);
    return null;
  }
  if (!log) return null;

  const row = log as Record<string, unknown>;
  const extra = row.extra_data as Record<string, unknown> | null;
  return {
    ...mapHabitLog(row),
    description: (extra?.notes as string) ?? null,
    lastCompletedAt: row.created_at ? String(row.created_at) : null,
  };
}

export async function insertHabitLog(
  admin: SupabaseClient,
  userId: string,
  habitType: string,
  value: number | null,
  metric: string | null,
  extraData: Record<string, unknown>,
): Promise<string | number | null> {
  const { data, error } = await admin
    .schema('habit')
    .from('habit_log')
    .insert({
      user_id: userId,
      habit_type: habitType,
      value,
      metric,
      extra_data: extraData,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[habit] insertHabitLog', error);
    return null;
  }
  return data?.id ?? null;
}

export async function listHabitLogsByType(
  admin: SupabaseClient,
  userId: string,
  habitType: string,
): Promise<Record<string, unknown>[] | null> {
  const { data, error } = await admin
    .schema('habit')
    .from('habit_log')
    .select('*')
    .eq('user_id', userId)
    .eq('habit_type', habitType)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[habit] listHabitLogsByType', error);
    return null;
  }
  return data ?? [];
}

export async function listDrinkCatalog(admin: SupabaseClient): Promise<Record<string, unknown>[] | null> {
  const { data, error } = await admin
    .schema('habit')
    .from('drink_catalog')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[habit] listDrinkCatalog', error);
    return null;
  }
  return data ?? [];
}
