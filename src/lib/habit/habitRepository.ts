import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import { listPaginated } from '@/lib/api/listQuery';
import type {
  HabitDetail,
  HabitListParams,
  HabitListResult,
  HabitSummary,
} from '@/lib/habit/contracts';

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
): Promise<HabitListResult> {
  const base = admin
    .schema('habit')
    .from('habit_log')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  const { rows, pagination } = await listPaginated(base as never, params, {
    defaultSortColumn: 'created_at',
    defaultAscending: false,
    errorContext: 'habits',
  });

  return {
    items: rows.map((row) => mapHabitLog(row as Record<string, unknown>)),
    pagination,
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
    throw new HttpError(500, 'Failed to fetch habit');
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
): Promise<string | number> {
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
    throw new HttpError(500, 'Failed to log habit');
  }
  if (data?.id == null) {
    throw new HttpError(500, 'Failed to log habit');
  }
  return data.id;
}

export async function listHabitLogsByType(
  admin: SupabaseClient,
  userId: string,
  habitType: string,
): Promise<Record<string, unknown>[]> {
  const { data, error } = await admin
    .schema('habit')
    .from('habit_log')
    .select('*')
    .eq('user_id', userId)
    .eq('habit_type', habitType)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[habit] listHabitLogsByType', error);
    throw new HttpError(500, 'Failed to fetch habit logs');
  }
  return data ?? [];
}

export async function listDrinkCatalog(admin: SupabaseClient): Promise<Record<string, unknown>[]> {
  const { data, error } = await admin
    .schema('habit')
    .from('drink_catalog')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[habit] listDrinkCatalog', error);
    throw new HttpError(500, 'Failed to fetch drink catalog');
  }
  return data ?? [];
}
