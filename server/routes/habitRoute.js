/**
 * Express Router for Habit Logging API with dependency injection support.
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { classifyError, mapErrorToResponse } = require('../observability/errors');
module.exports = function createHabitRoutes(deps = {}) {
  const router = express.Router();
  const { habitService, alcoholService, exerciseService, habitApi, logger } = deps;

  if (!habitService) {
    throw new Error('createHabitRoutes requires a habitService dependency');
  }

  router.use(authMiddleware());

  // Get all habit logs for the authenticated user
  function logError(event, error, classification, req) {
    const scopedLogger = req.logger || logger;
    const level = classification?.type === 'validation' ? 'warn' : 'error';
    scopedLogger?.[level]?.(event, {
      error,
      correlationId: req.context?.correlationId,
      error_class: classification?.errorClass,
      is_recoverable: classification?.isRecoverable,
      is_user_facing: classification?.isUserFacing,
    });
  }

  router.get('/', async (req, res) => {
    const requestLogger = req.logger || logger;
    try {
      const params = {
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      };
      const result = await habitService.listHabits(req.user.id, params, { logger: requestLogger });
      res.json(result);
    } catch (error) {
      const classification = classifyError({ ...error, code: error?.code || 'HABIT_LIST_FAILED' });
      logError('habitRoute.list.failed', error, classification, req);
      const response = mapErrorToResponse({ ...error, code: classification.code }, { defaultMessage: 'Failed to fetch habits' });
      res.status(response.status).json(response.body);
    }
  });

  // Aggregate stats for the authenticated user over a given period
  router.get('/stats/:period', async (req, res) => {
    try {
      if (!habitService.getStats) {
        return res.status(501).json({ error: 'Habit stats not available', code: 'HABIT_STATS_PROVIDER_MISSING' });
      }

      const stats = await habitService.getStats(req.user.id, req.params.period, undefined, { logger: req.logger || logger });
      return res.json(stats);
    } catch (error) {
      const classification = classifyError(error, { defaultCode: 'HABIT_STATS_FETCH_FAILED' });
      const status = classification.status;
      const errorMessage =
        classification.code === 'HABIT_INVALID_PERIOD' || classification.code === 'HABIT_INVALID_METRIC'
          ? 'Invalid stats request'
          : classification.code === 'HABIT_STATS_PROVIDER_MISSING'
            ? 'Stats provider unavailable'
            : 'Internal Server Error';

      logError('habitRoute.stats.failed', error, classification, req);
      return res.status(status).json({
        error: errorMessage,
        code: classification.code,
      });
    }
  });

  // Get a single habit log by id (stubbed contract)
  router.get('/entries/:id', async (req, res) => {
    try {
      const habit = await habitService.getHabitById(req.params.id, { logger: req.logger || logger });
      if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
      }
      return res.json(habit);
    } catch (error) {
      const response = mapErrorToResponse(error, { defaultMessage: 'Failed to fetch habit detail' });
      logError('habitRoute.detail.failed', error, response.classification, req);
      return res.status(response.status).json(response.body);
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
      const classification = classifyError(error, { defaultCode: 'HABIT_CREATE_FAILED' });
      logError('habitRoute.log.failed', error, classification, req);
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
      logError('habitRoute.typeLogs.failed', error, classifyError(error), req);
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
      logError('habitRoute.data.failed', error, classifyError(error), req);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Aggregates
  router.get('/:habitType/aggregates', async (req, res) => {
    const { habitType } = req.params;
    try {
      const aggregates = await habitService.getAggregates(req.user.id, habitType, { logger: req.logger || logger });
      res.json(aggregates);
    } catch (error) {
      const classification = classifyError(error, { defaultCode: 'HABIT_AGGREGATE_PROVIDER_MISSING' });
      const status = classification.status || 500;
      logError('habitRoute.aggregates.failed', error, classification, req);
      res.status(status).json({
        error: status === 400 ? 'Invalid habit type' : status === 501 ? 'Aggregate provider unavailable' : 'Internal Server Error',
        code: classification.code,
      });
    }
  });

  return router;
};
