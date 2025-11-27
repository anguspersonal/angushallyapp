const express = require('express');

function createHealthRouter({ db, logger } = {}) {
  const router = express.Router();
  router.get('/health', (req, res) => {
    res.json({ status: 'backend-ok', time: new Date().toISOString() });
  });

  router.get('/ready', async (_req, res) => {
    try {
      if (db?.query) {
        await db.query('SELECT 1');
      }
      res.json({ status: 'ready', time: new Date().toISOString() });
    } catch (error) {
      logger?.error?.('readiness check failed', { message: error.message });
      res.status(503).json({ status: 'degraded' });
    }
  });
  return router;
}

function registerHealthChecks(app, deps = {}) {
  app.use('/api', createHealthRouter(deps));
}

module.exports = { createHealthRouter, registerHealthChecks };
