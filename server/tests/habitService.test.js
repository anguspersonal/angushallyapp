const { createHabitService, DEFAULT_PAGE_SIZE, DEFAULT_PAGE, MAX_PAGE_SIZE } = require('../services/habitService');

describe('habitService', () => {
  function createHabitApi(overrides = {}) {
    return {
      getHabitLogsFromDB: jest.fn().mockResolvedValue([]),
      getHabitAggregates: jest.fn().mockResolvedValue({ sum: 5, avg: 2.5 }),
      logHabitLog: jest.fn(),
      ...overrides,
    };
  }

  test('listHabits applies defaults and pagination metadata', async () => {
    const habitApi = createHabitApi({ getHabitLogsFromDB: jest.fn().mockResolvedValue([{ id: 1, habit_type: 'run' }]) });
    const service = createHabitService({ habitApi });

    const result = await service.listHabits('user-1', {});

    expect(habitApi.getHabitLogsFromDB).toHaveBeenCalledWith('user-1', DEFAULT_PAGE_SIZE, 0);
    expect(result.items[0]).toMatchObject({ id: 1, name: 'run' });
    expect(result.pagination).toMatchObject({ page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE, hasMore: false });
  });

  test('listHabits clamps pageSize and computes hasMore', async () => {
    const habitApi = createHabitApi({
      getHabitLogsFromDB: jest.fn().mockResolvedValue(
        Array.from({ length: MAX_PAGE_SIZE }, (_, idx) => ({ id: idx, habit_type: 'walk' })),
      ),
    });
    const service = createHabitService({ habitApi });
    const result = await service.listHabits('user-1', { pageSize: MAX_PAGE_SIZE + 10, page: 2 });

    expect(habitApi.getHabitLogsFromDB).toHaveBeenCalledWith('user-1', MAX_PAGE_SIZE, MAX_PAGE_SIZE);
    expect(result.pagination.hasMore).toBe(true);
  });

  test('getHabitById returns null when missing', async () => {
    const habitApi = createHabitApi();
    const service = createHabitService({ habitApi });
    const result = await service.getHabitById('missing');
    expect(result).toBeNull();
  });

  test('getStats maps provider metrics into HabitStats and validates period', async () => {
    const habitApi = createHabitApi({ getHabitAggregates: jest.fn().mockResolvedValue({ sum: 10, avg: 5, min: 1 }) });
    const service = createHabitService({ habitApi });
    const stats = await service.getStats('user-1', 'week', ['sum', 'avg']);

    expect(habitApi.getHabitAggregates).toHaveBeenCalledWith('week', ['sum', 'avg'], 'user-1');
    expect(stats).toEqual({ period: 'week', sum: 10, avg: 5 });

    await expect(service.getStats('user-1', 'invalid')).rejects.toMatchObject({ code: 'INVALID_PERIOD' });
  });

  test('getStats wraps provider failures without leaking internals', async () => {
    const habitApi = createHabitApi({ getHabitAggregates: jest.fn().mockRejectedValue(new Error('db broke')) });
    const service = createHabitService({ habitApi });

    await expect(service.getStats('user-1', 'week')).rejects.toMatchObject({ code: 'STATS_FETCH_FAILED' });
  });

  test('getAggregates delegates to alcohol provider and validates habit type', async () => {
    const habitApi = createHabitApi();
    const alcoholService = { getAlcoholAggregates: jest.fn().mockResolvedValue({ sum: 1 }) };
    const aggregateService = { getAggregateStats: jest.fn().mockResolvedValue({ sum: 2 }) };
    const service = createHabitService({ habitApi, alcoholService, aggregateService });

    const alcoholResult = await service.getAggregates('user-1', 'alcohol');
    expect(alcoholService.getAlcoholAggregates).toHaveBeenCalledWith('user-1');
    expect(alcoholResult).toEqual({ sum: 1 });

    const exerciseResult = await service.getAggregates('user-1', 'exercise');
    expect(aggregateService.getAggregateStats).toHaveBeenCalledWith('user-1', 'exercise');
    expect(exerciseResult).toEqual({ sum: 2 });

    await expect(service.getAggregates('user-1')).rejects.toMatchObject({ code: 'INVALID_HABIT_TYPE' });
  });
});
