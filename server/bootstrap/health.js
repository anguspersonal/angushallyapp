const express = require('express');

function createHealthRouter({ db, logger } = {}) {
  const router = express.Router();
  router.get('/health', (req, res) => {
    const scopedLogger = req?.logger || logger;
    scopedLogger?.info?.('health:liveness', {
      component: 'health',
      check: 'liveness',
      correlationId: req?.context?.correlationId || req?.requestId,
      status: 'ok',
    });
    res.json({ status: 'backend-ok', time: new Date().toISOString() });
  });

  router.get('/ready', async (req, res) => {
    try {
      if (db?.query) {
        await db.query('SELECT 1');
      }
      const scopedLogger = req?.logger || logger;
      scopedLogger?.info?.('health:readiness', {
        component: 'health',
        check: 'db',
        correlationId: req?.context?.correlationId || req?.requestId,
        status: 'ok',
      });
      res.json({ status: 'ready', time: new Date().toISOString() });
    } catch (error) {
      const scopedLogger = req?.logger || logger;
      scopedLogger?.error?.('readiness check failed', {
        message: error.message,
        component: 'health',
        check: 'db',
        correlationId: req?.context?.correlationId || req?.requestId,
      });
      res.status(503).json({ status: 'degraded', traceId: req?.context?.correlationId || req?.requestId });
    }
  });
  return router;
}

function registerHealthChecks(app, deps = {}) {
  app.use('/api', createHealthRouter(deps));
}

module.exports = { createHealthRouter, registerHealthChecks };
