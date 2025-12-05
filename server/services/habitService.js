// @ts-check
/**
 * Skeleton habit service to mirror the domain/service pattern used by content.
 * Implementation will wrap the existing habit-api modules once migrated.
 */

/** @typedef {import('../../shared/services/habit/contracts').HabitListParams} HabitListParams */
/** @typedef {import('../../shared/services/habit/contracts').HabitListResult} HabitListResult */
/** @typedef {import('../../shared/services/habit/contracts').HabitSummary} HabitSummary */
/** @typedef {import('../../shared/services/habit/contracts').HabitDetail} HabitDetail */
/** @typedef {import('../../shared/services/habit/contracts').HabitStats} HabitStats */
/** @typedef {import('../../shared/services/habit/contracts').HabitPeriod} HabitPeriod */
/** @typedef {import('../../shared/services/habit/contracts').HabitMetric} HabitMetric */

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const DEFAULT_METRICS = ['sum', 'avg', 'min', 'max', 'stddev'];

function clampPageSize(value) {
  const parsed = parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(parsed, MAX_PAGE_SIZE);
}

function parsePage(value) {
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE;
}

function mapHabitLog(log) {
  return /** @type {HabitSummary} */ ({
    id: log.id,
    name: log.habit_type,
    cadence: log.metric ?? null,
    lastLoggedAt: log.created_at ?? null,
    publishedAt: log.published_at ?? null,
    updatedAt: log.updated_at ?? null,
  });
}

function createHabitService(deps = {}) {
  const { habitApi, aggregateService, alcoholService, exerciseService, logger = console } = deps;

  if (!habitApi || typeof habitApi.getHabitLogsFromDB !== 'function') {
    throw new Error('createHabitService requires a habitApi dependency with getHabitLogsFromDB');
  }

  /**
   * Placeholder list handler to demonstrate the shared contract usage.
   * Currently delegates to the existing API implementation until a full
   * migration is completed.
   * @param {string} userId
   * @param {HabitListParams} [params]
   * @returns {Promise<HabitListResult>}
   */
  async function listHabits(userId, params = {}) {
    const page = parsePage(params.page);
    const pageSize = clampPageSize(params.pageSize);
    const offset = (page - 1) * pageSize;
    const logs = await habitApi.getHabitLogsFromDB(userId, pageSize, offset);
    /** @type {HabitSummary[]} */
    const items = Array.isArray(logs) ? logs.map(mapHabitLog) : [];
    const totalItems = Array.isArray(logs) && typeof logs.total === 'number' ? logs.total : offset + items.length;
    const hasMore = items.length === pageSize;

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.max(hasMore ? page + 1 : page, 1),
        hasMore,
      },
    };
  }

  /**
   * Placeholder detail fetcher.
   * @param {string | number} id
   * @returns {Promise<HabitDetail | null>}
   */
  async function getHabitById(id) {
    try {
      const logs = await habitApi.getHabitLogsFromDB();
      const match = Array.isArray(logs) ? logs.find((log) => log.id === id) : null;
      return match
        ? {
            ...mapHabitLog(match),
            description: match.extra_data?.notes ?? null,
          }
        : null;
    } catch (error) {
      logger.error?.('Failed to fetch habit by id', error);
      throw error;
    }
  }

  /**
   * Placeholder creator that forwards to the existing API.
   * @param {string} userId
   * @param {{ name: string; value: number; metric?: string; extraData?: Record<string, unknown> | null }} input
   */
  async function createHabit(userId, input) {
    try {
      return await habitApi.logHabitLog(userId, input.name, input.value, input.metric, input.extraData);
    } catch (error) {
      logger.error?.('Failed to create habit log', error);
      throw error;
    }
  }

  /**
   * Aggregate stats for the authenticated user over a period.
   * Falls back to the legacy habitApi implementation while we migrate.
   * @param {string} userId
   * @param {'day' | 'week' | 'month' | 'year' | 'all'} period
   * @param {string[]} [metrics]
   */
  async function getStats(userId, period, metrics = DEFAULT_METRICS) {
    const supportedPeriods = new Set(['day', 'week', 'month', 'year', 'all']);
    const resolvedPeriod = supportedPeriods.has(period) ? /** @type {HabitPeriod} */ (period) : null;
    if (!resolvedPeriod) {
      const error = new Error(`Unsupported period: ${period}`);
      error.code = 'INVALID_PERIOD';
      throw error;
    }

    if (typeof habitApi.getHabitAggregates !== 'function') {
      const error = new Error('Habit stats provider not configured');
      error.code = 'MISSING_STATS_PROVIDER';
      throw error;
    }

    try {
      const rawStats = await habitApi.getHabitAggregates(resolvedPeriod, metrics, userId);
      /** @type {HabitStats} */
      const shaped = { period: resolvedPeriod };
      metrics.forEach((metric) => {
        const value = rawStats?.[metric];
        if (typeof value === 'number') {
          shaped[metric] = value;
        }
      });
      return shaped;
    } catch (error) {
      logger.error?.('Failed to fetch habit stats', error);
      const wrapped = new Error('Failed to fetch habit stats');
      wrapped.code = 'STATS_FETCH_FAILED';
      throw wrapped;
    }
  }

  async function getAggregates(userId, habitType) {
    if (!habitType) {
      const error = new Error('Habit type is required');
      error.code = 'INVALID_HABIT_TYPE';
      throw error;
    }

    try {
      if (habitType === 'alcohol' && alcoholService?.getAlcoholAggregates) {
        return await alcoholService.getAlcoholAggregates(userId);
      }

      if (aggregateService?.getAggregateStats) {
        return await aggregateService.getAggregateStats(userId, habitType);
      }

      const error = new Error('Habit aggregate provider not configured');
      error.code = 'MISSING_AGGREGATE_PROVIDER';
      throw error;
    } catch (error) {
      logger.error?.('Failed to fetch habit aggregates', error);
      throw error;
    }
  }

  return {
    listHabits,
    getHabitById,
    createHabit,
    getStats,
    getAggregates,
  };
}

module.exports = {
  createHabitService,
  mapHabitLog,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
};
