jest.mock('../middleware/auth', () => ({
  authMiddleware: () => (req, _res, next) => {
    req.user = { id: 'user-1' };
    next();
  },
}));

const express = require('express');
const request = require('supertest');
const createHabitRoutes = require('../routes/habitRoute');

const sampleHabit = { id: '1', name: 'run', cadence: 'daily', lastLoggedAt: '2024-01-01' };

function createApp(overrides = {}) {
  const habitService = {
    listHabits: jest.fn().mockResolvedValue({
      items: [sampleHabit],
      pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasMore: false },
    }),
    getHabitById: jest.fn().mockResolvedValue(sampleHabit),
    ...overrides,
  };

  const app = express();
  app.use(express.json());
  app.use('/api/habit', createHabitRoutes({ habitService, logger: { error: jest.fn() } }));
  return { app, habitService };
}

describe('habitRoute integration', () => {
  test('GET /api/habit returns paginated items', async () => {
    const { app, habitService } = createApp();
    const response = await request(app).get('/api/habit?page=2&pageSize=5');

    expect(habitService.listHabits).toHaveBeenCalledWith('user-1', { page: 2, pageSize: 5 });
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.pagination.hasMore).toBe(false);
  });

  test('GET /api/habit/entries/:id returns detail or 404', async () => {
    const { app, habitService } = createApp();
    const ok = await request(app).get('/api/habit/entries/1');
    expect(habitService.getHabitById).toHaveBeenCalledWith('1');
    expect(ok.status).toBe(200);

    const missingApp = createApp({ getHabitById: jest.fn().mockResolvedValue(null) });
    const missing = await request(missingApp.app).get('/api/habit/entries/999');
    expect(missing.status).toBe(404);
  });
});
