const { createHabitService, DEFAULT_PAGE_SIZE, DEFAULT_PAGE, MAX_PAGE_SIZE } = require('../services/habitService');

describe('habitService', () => {
  function createHabitApi(overrides = {}) {
    return {
      getHabitLogsFromDB: jest.fn().mockResolvedValue([]),
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
});
