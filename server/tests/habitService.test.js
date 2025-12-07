const { createHabitService, DEFAULT_PAGE_SIZE, DEFAULT_PAGE, MAX_PAGE_SIZE } = require('../services/habitService');
const { HABIT_METRICS, HABIT_PERIODS } = require('../../shared/services/habit/contracts');
const { createHabitServiceDeps } = require('./helpers/serviceMocks');

const WEEK_PERIOD = HABIT_PERIODS.find((period) => period === 'week') || HABIT_PERIODS[0];
const MONTH_PERIOD = HABIT_PERIODS.find((period) => period === 'month') || HABIT_PERIODS[0];

describe('habitService', () => {
  test('listHabits applies defaults and pagination metadata', async () => {
    const { habitApi } = createHabitServiceDeps({
      habitApiOverrides: { getHabitLogsFromDB: jest.fn().mockResolvedValue([{ id: 1, habit_type: 'run' }]) },
    });
    const service = createHabitService({ habitApi });

    const result = await service.listHabits('user-1', {});

    expect(habitApi.getHabitLogsFromDB).toHaveBeenCalledWith('user-1', DEFAULT_PAGE_SIZE, 0);
    expect(result.items[0]).toMatchObject({ id: 1, name: 'run' });
    expect(result.pagination).toMatchObject({ page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE, hasMore: false });
  });

  test('listHabits clamps pageSize and computes hasMore', async () => {
    const { habitApi } = createHabitServiceDeps({
      habitApiOverrides: {
        getHabitLogsFromDB: jest
          .fn()
          .mockResolvedValue(Array.from({ length: MAX_PAGE_SIZE }, (_, idx) => ({ id: idx, habit_type: 'walk' }))),
      },
    });
    const service = createHabitService({ habitApi });
    const result = await service.listHabits('user-1', { pageSize: MAX_PAGE_SIZE + 10, page: 2 });

    expect(habitApi.getHabitLogsFromDB).toHaveBeenCalledWith('user-1', MAX_PAGE_SIZE, MAX_PAGE_SIZE);
    expect(result.pagination.hasMore).toBe(true);
  });

  test('listHabits returns empty envelope with stable pagination when no logs exist', async () => {
    const { habitApi } = createHabitServiceDeps({
      habitApiOverrides: { getHabitLogsFromDB: jest.fn().mockResolvedValue([]) },
    });
    const service = createHabitService({ habitApi });

    const result = await service.listHabits('user-2');

    expect(result.items).toEqual([]);
    expect(result.pagination).toMatchObject({
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      totalItems: 0,
      totalPages: 1,
      hasMore: false,
    });
  });

  test('listHabits surfaces provider total hints to compute pages', async () => {
    const logs = Object.assign(
      Array.from({ length: DEFAULT_PAGE_SIZE }, (_, idx) => ({ id: idx, habit_type: 'walk' })),
      { total: 25 },
    );
    const { habitApi } = createHabitServiceDeps({ habitApiOverrides: { getHabitLogsFromDB: jest.fn().mockResolvedValue(logs) } });
    const service = createHabitService({ habitApi });

    const result = await service.listHabits('user-1', { page: 1 });

    expect(result.pagination.totalItems).toBe(25);
    expect(result.pagination.totalPages).toBeGreaterThanOrEqual(2);
    expect(result.pagination.hasMore).toBe(true);
  });

  test('listHabits handles middle and trailing pages with stable metadata', async () => {
    const pageSize = 3;
    const firstPageLogs = Object.assign(
      Array.from({ length: pageSize }, (_, idx) => ({ id: idx, habit_type: 'walk' })),
      { total: 7 },
    );
    const middlePageLogs = Object.assign(
      Array.from({ length: pageSize }, (_, idx) => ({ id: idx + 3, habit_type: 'walk' })),
      { total: 7 },
    );
    const lastPageLogs = Object.assign([ { id: 6, habit_type: 'walk' } ], { total: 7 });

    const { habitApi } = createHabitServiceDeps({
      habitApiOverrides: {
        getHabitLogsFromDB: jest
          .fn()
          .mockResolvedValueOnce(firstPageLogs)
          .mockResolvedValueOnce(middlePageLogs)
          .mockResolvedValueOnce(lastPageLogs),
      },
    });
    const service = createHabitService({ habitApi });

    const firstPage = await service.listHabits('user-1', { page: 1, pageSize });
    const secondPage = await service.listHabits('user-1', { page: 2, pageSize });
    const thirdPage = await service.listHabits('user-1', { page: 3, pageSize });

    expect(firstPage.pagination).toMatchObject({ page: 1, totalItems: 7, totalPages: 3, hasMore: true });
    expect(secondPage.pagination).toMatchObject({ page: 2, totalItems: 7, totalPages: 3, hasMore: true });
    expect(thirdPage.pagination).toMatchObject({ page: 3, totalItems: 7, totalPages: 3, hasMore: false });
  });

  test('listHabits infers totals when providers omit counts across multiple pages', async () => {
    const pageSize = 3;
    const firstPageLogs = Array.from({ length: pageSize }, (_, idx) => ({ id: idx, habit_type: 'walk' }));
    const middlePageLogs = Array.from({ length: pageSize }, (_, idx) => ({ id: idx + 3, habit_type: 'walk' }));
    const lastPageLogs = [{ id: 6, habit_type: 'walk' }];

    const { habitApi } = createHabitServiceDeps({
      habitApiOverrides: {
        getHabitLogsFromDB: jest
          .fn()
          .mockResolvedValueOnce(firstPageLogs)
          .mockResolvedValueOnce(middlePageLogs)
          .mockResolvedValueOnce(lastPageLogs),
      },
    });
    const service = createHabitService({ habitApi });

    const firstPage = await service.listHabits('user-1', { page: 1, pageSize });
    const middlePage = await service.listHabits('user-1', { page: 2, pageSize });
    const finalPage = await service.listHabits('user-1', { page: 3, pageSize });

    expect(firstPage.pagination).toMatchObject({ page: 1, totalItems: 7, totalPages: 3, hasMore: true });
    expect(middlePage.pagination).toMatchObject({ page: 2, totalItems: 7, totalPages: 3, hasMore: true });
    expect(finalPage.pagination).toMatchObject({ page: 3, totalItems: 7, totalPages: 3, hasMore: false });
  });

  test('listHabits keeps pagination stable when provider totals are lower than the requested page', async () => {
    const { habitApi } = createHabitServiceDeps({
      habitApiOverrides: {
        getHabitLogsFromDB: jest.fn().mockResolvedValue(Object.assign([], { total: 4 })),
      },
    });
    const service = createHabitService({ habitApi });

    const page = await service.listHabits('user-1', { page: 3, pageSize: 3 });

    expect(page.items).toEqual([]);
    expect(page.pagination).toMatchObject({ page: 3, totalItems: 4, totalPages: 2, hasMore: false });
  });

  test('getHabitById returns null when missing', async () => {
    const { habitApi } = createHabitServiceDeps();
    const service = createHabitService({ habitApi });
    const result = await service.getHabitById('missing');
    expect(result).toBeNull();
  });

  test('getStats maps provider metrics into HabitStats and validates period', async () => {
    const { habitApi } = createHabitServiceDeps({
      habitApiOverrides: { getHabitAggregates: jest.fn().mockResolvedValue({ sum: 10, avg: 5, min: 1 }) },
    });
    const service = createHabitService({ habitApi });
    const stats = await service.getStats('user-1', WEEK_PERIOD, ['sum', 'avg']);

    expect(habitApi.getHabitAggregates).toHaveBeenCalledWith(WEEK_PERIOD, ['sum', 'avg'], 'user-1');
    expect(stats).toEqual({
      period: WEEK_PERIOD,
      totalCompleted: 10,
      averagePerEntry: 5,
      minimumPerEntry: 1,
      maximumPerEntry: 0,
      standardDeviation: 0,
    });

    await expect(service.getStats('user-1', 'invalid')).rejects.toMatchObject({
      code: 'HABIT_INVALID_PERIOD',
      type: 'validation',
      message: 'Unsupported period: invalid',
    });
  });

  test('getStats falls back to default metrics when input is invalid and fills missing values', async () => {
    const { habitApi } = createHabitServiceDeps({
      habitApiOverrides: { getHabitAggregates: jest.fn().mockResolvedValue({ sum: 4 }) },
    });
    const service = createHabitService({ habitApi });

    await expect(service.getStats('user-2', MONTH_PERIOD, ['bogus'])).rejects.toMatchObject({
      code: 'HABIT_INVALID_METRIC',
      type: 'validation',
    });

    const stats = await service.getStats('user-2', MONTH_PERIOD);

    expect(habitApi.getHabitAggregates).toHaveBeenCalledWith(MONTH_PERIOD, HABIT_METRICS, 'user-2');
    expect(stats).toEqual({
      period: MONTH_PERIOD,
      totalCompleted: 4,
      averagePerEntry: 0,
      minimumPerEntry: 0,
      maximumPerEntry: 0,
      standardDeviation: 0,
    });
  });

  test('getStats zero-fills missing metrics even when provider returns sparse payloads', async () => {
    const { habitApi } = createHabitServiceDeps({
      habitApiOverrides: { getHabitAggregates: jest.fn().mockResolvedValue({ sum: 8, max: null }) },
    });
    const service = createHabitService({ habitApi });

    const stats = await service.getStats('user-3', WEEK_PERIOD, ['sum', 'max']);

    expect(stats).toEqual({
      period: WEEK_PERIOD,
      totalCompleted: 8,
      averagePerEntry: 0,
      minimumPerEntry: 0,
      maximumPerEntry: 0,
      standardDeviation: 0,
    });
  });

  test('getStats wraps provider failures without leaking internals', async () => {
    const { habitApi } = createHabitServiceDeps({
      habitApiOverrides: { getHabitAggregates: jest.fn().mockRejectedValue(new Error('db broke')) },
    });
    const service = createHabitService({ habitApi });

    await expect(service.getStats('user-1', WEEK_PERIOD)).rejects.toMatchObject({
      code: 'HABIT_STATS_FETCH_FAILED',
      type: 'dependency',
      message: 'Failed to fetch habit stats',
    });
  });

  test('getStats signals missing provider dependency explicitly', async () => {
    const { habitApi } = createHabitServiceDeps({ habitApiOverrides: { getHabitAggregates: undefined } });
    const service = createHabitService({ habitApi });

    await expect(service.getStats('user-1', WEEK_PERIOD)).rejects.toMatchObject({
      code: 'HABIT_STATS_PROVIDER_MISSING',
      type: 'dependency',
    });
  });

  test('getAggregates delegates to alcohol provider and validates habit type', async () => {
    const { habitApi, alcoholService, aggregateService } = createHabitServiceDeps({
      alcoholServiceOverrides: { getAlcoholAggregates: jest.fn().mockResolvedValue({ sum: 1 }) },
      aggregateServiceOverrides: { getAggregateStats: jest.fn().mockResolvedValue({ sum: 2 }) },
    });
    const service = createHabitService({ habitApi, alcoholService, aggregateService });

    const alcoholResult = await service.getAggregates('user-1', 'alcohol');
    expect(alcoholService.getAlcoholAggregates).toHaveBeenCalledWith('user-1');
    expect(alcoholResult).toEqual({ sum: 1 });

    const exerciseResult = await service.getAggregates('user-1', 'exercise');
    expect(aggregateService.getAggregateStats).toHaveBeenCalledWith('user-1', 'exercise');
    expect(exerciseResult).toEqual({ sum: 2 });

    await expect(service.getAggregates('user-1')).rejects.toMatchObject({
      code: 'HABIT_INVALID_TYPE',
      type: 'validation',
      message: 'Habit type is required',
    });
  });

  test('getAggregates surfaces missing providers with dependency codes', async () => {
    const { habitApi } = createHabitServiceDeps({
      aggregateServiceOverrides: undefined,
      alcoholServiceOverrides: undefined,
    });
    const service = createHabitService({ habitApi });

    await expect(service.getAggregates('user-1', 'exercise')).rejects.toMatchObject({
      code: 'HABIT_AGGREGATE_PROVIDER_MISSING',
      type: 'dependency',
    });
  });

  test('createHabit wraps provider errors with stable taxonomy', async () => {
    const { habitApi } = createHabitServiceDeps({
      habitApiOverrides: { logHabitLog: jest.fn().mockRejectedValue(new Error('boom')) },
    });
    const service = createHabitService({ habitApi });

    await expect(service.createHabit('user-1', { name: 'walk', value: 1 })).rejects.toMatchObject({
      code: 'HABIT_CREATE_FAILED',
      type: 'dependency',
    });
  });
});
