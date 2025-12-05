/**
 * Express Router for Habit Logging API with dependency injection support.
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
module.exports = function createHabitRoutes(deps = {}) {
  const router = express.Router();
  const { habitService, alcoholService, exerciseService, habitApi, logger = console } = deps;

  if (!habitService) {
    throw new Error('createHabitRoutes requires a habitService dependency');
  }

  router.use(authMiddleware());

  // Get all habit logs for the authenticated user
  router.get('/', async (req, res) => {
    try {
      const params = {
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      };
      const result = await habitService.listHabits(req.user.id, params);
      res.json(result);
    } catch (error) {
      logger.error?.('Error fetching habit logs', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Aggregate stats for the authenticated user over a given period
  router.get('/stats/:period', async (req, res) => {
    try {
      if (!habitService.getStats) {
        return res.status(501).json({ error: 'Habit stats not available' });
      }

      const stats = await habitService.getStats(req.user.id, req.params.period);
      return res.json(stats);
    } catch (error) {
      const status = error?.code === 'INVALID_PERIOD' ? 400 : 500;
      logger.error?.('Error fetching habit stats', error);
      return res.status(status).json({
        error: status === 400 ? 'Invalid period' : 'Internal Server Error',
        code: error?.code,
      });
    }
  });

  // Get a single habit log by id (stubbed contract)
  router.get('/entries/:id', async (req, res) => {
    try {
      const habit = await habitService.getHabitById(req.params.id);
      if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
      }
      return res.json(habit);
    } catch (error) {
      logger.error?.('Error fetching habit detail', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Add Habit Log
  router.post('/:habitType', async (req, res) => {
    const { value, metric, extraData } = req.body;
    const { habitType } = req.params;

    if (!['alcohol', 'exercise'].includes(habitType)) {
      return res.status(400).json({ error: 'Invalid habit type' });
    }

    try {
      const logId = await habitApi.logHabitLog(req.user.id, habitType, value, metric, extraData);
      let result;

      switch (habitType) {
        case 'alcohol':
          result = await alcoholService.logAlcohol(logId, extraData, req.user.id);
          break;
        case 'exercise':
          result = await exerciseService.logExercise(logId, extraData, req.user.id);
          break;
        default:
          break;
      }

      res.json({ message: 'Habit logged successfully', logId, ...result });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error logging habit:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get logs for a specific habit type
  router.get('/:habitType/logs', async (req, res) => {
    const { habitType } = req.params;
    try {
      let logs;
      switch (habitType) {
        case 'alcohol':
          logs = await alcoholService.getAlcoholLogs(req.user.id);
          break;
        case 'exercise':
          logs = await exerciseService.getExerciseLogs(req.user.id);
          break;
        default:
          return res.status(400).json({ error: 'Invalid habit type' });
      }
      res.json(logs);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching habit logs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get habit-specific data (e.g., drink catalog)
  router.get('/:habitType/data', async (req, res) => {
    const { habitType } = req.params;
    try {
      let data;
      switch (habitType) {
        case 'alcohol':
          data = await alcoholService.getDrinkCatalog();
          break;
        default:
          return res.status(400).json({ error: 'Invalid habit type' });
      }
      res.json(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching habit data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Aggregates
  router.get('/:habitType/aggregates', async (req, res) => {
    const { habitType } = req.params;
    try {
      const aggregates = await habitService.getAggregates(req.user.id, habitType);
      res.json(aggregates);
    } catch (error) {
      const status = error?.code === 'INVALID_HABIT_TYPE' ? 400 : error?.code === 'MISSING_AGGREGATE_PROVIDER' ? 501 : 500;
      logger.error?.('Error fetching habit aggregates', error);
      res.status(status).json({ error: status === 400 ? 'Invalid habit type' : 'Internal Server Error' });
    }
  });

  return router;
};
