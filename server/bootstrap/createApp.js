const express = require('express');
const { configureMiddleware } = require('./middleware');
const { registerRoutes } = require('./routes');
const { registerHealthChecks } = require('./health');
const { createLogger } = require('../observability/logger');

function createApp({ config, httpClient, db, logger, nextHandler } = {}) {
  if (!config) {
    // eslint-disable-next-line global-require
    config = require('../config');
  }

  if (!logger) {
    logger = createLogger({ service: 'api-server', environment: config.nodeEnv });
  }

  const app = express();
  app.logger = logger;

  configureMiddleware(app, { config, logger });
  registerRoutes(app, { config, httpClient, db, logger, nextHandler });
  registerHealthChecks(app, { config, db, logger });

  return app;
}

module.exports = { createApp };
