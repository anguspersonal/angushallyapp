const {
  createMockDb,
  createMockLogger,
  createContentRow,
  createContentPage,
  createHabitLog,
  createHabitApiMock,
  createContentServiceDeps,
  createHabitServiceDeps,
} = require('./serviceMocks');

describe('serviceMocks helpers', () => {
  test('createMockDb returns isolated db instances with default query stub', async () => {
    const dbA = createMockDb();
    const dbB = createMockDb();

    await dbA.query('SELECT 1');

    expect(dbA.query).toHaveBeenCalledTimes(1);
    expect(dbB.query).not.toHaveBeenCalled();
    expect(dbA.query).not.toBe(dbB.query);
  });

  test('createMockLogger produces fresh spies for each call', () => {
    const loggerA = createMockLogger();
    const loggerB = createMockLogger();

    loggerA.error('oops');

    expect(loggerA.error).toHaveBeenCalledWith('oops');
    expect(loggerB.error).not.toHaveBeenCalled();
  });

  test('createContentRow merges overrides on top of defaults without mutation', () => {
    const row = createContentRow({ id: 99, slug: 'custom' });
    const anotherRow = createContentRow();

    expect(row).toMatchObject({ id: 99, slug: 'custom' });
    expect(anotherRow).toMatchObject({ id: 1, slug: 'hello-world' });
    expect(anotherRow).toHaveProperty('published_at', '2024-01-01');
  });

  test('createContentPage shapes pagination metadata consistently across pages', () => {
    const page = createContentPage({
      items: [createContentRow({ id: 2, slug: 'page-2' })],
      page: 2,
      pageSize: 5,
      totalItems: 12,
    });

    expect(page.pagination).toMatchObject({
      totalItems: 12,
      page: 2,
      pageSize: 5,
      totalPages: 3,
      hasMore: true,
    });
  });

  test('createHabitLog builds provider-shaped rows without mutating defaults', () => {
    const log = createHabitLog({ id: 'custom-log', habit_type: 'run', extra_data: null });
    const another = createHabitLog();

    expect(log).toMatchObject({ id: 'custom-log', habit_type: 'run', extra_data: null });
    expect(another.id).toBe('habit-log-1');
    expect(another.extra_data).toEqual({ notes: 'morning walk' });
  });

  test('createHabitApiMock mirrors habit service dependencies', async () => {
    const habitApi = createHabitApiMock();
    await habitApi.getHabitLogsFromDB('user-1', 10, 0);
    const aggregates = await habitApi.getHabitAggregates('week', ['sum'], 'user-1');

    expect(habitApi.getHabitLogsFromDB).toHaveBeenCalledWith('user-1', 10, 0);
    expect(habitApi.getHabitAggregates).toHaveBeenCalledWith('week', ['sum'], 'user-1');
    expect(aggregates).toEqual({ sum: 0, avg: 0, min: 0, max: 0, stddev: 0 });
    expect(typeof habitApi.logHabitLog).toBe('function');
  });

  test('createHabitApiMock returns isolated stubs per call', () => {
    const first = createHabitApiMock();
    const second = createHabitApiMock();

    first.getHabitLogsFromDB('user-1', 1, 0);

    expect(first.getHabitLogsFromDB).toHaveBeenCalled();
    expect(second.getHabitLogsFromDB).not.toHaveBeenCalled();
  });

  test('createContentServiceDeps creates distinct db and logger instances', () => {
    const first = createContentServiceDeps();
    const second = createContentServiceDeps();

    expect(first.db).not.toBe(second.db);
    expect(first.logger).not.toBe(second.logger);
    expect(typeof first.db.query).toBe('function');
  });

  test('createHabitServiceDeps wires each optional dependency at the service boundary', () => {
    const deps = createHabitServiceDeps();

    expect(typeof deps.habitApi.getHabitLogsFromDB).toBe('function');
    expect(typeof deps.aggregateService.getAggregateStats).toBe('function');
    expect(typeof deps.alcoholService.getAlcoholAggregates).toBe('function');
    expect(typeof deps.logger.error).toBe('function');
  });
});
