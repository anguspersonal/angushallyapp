const express = require('express');
const { configureMiddleware } = require('./middleware');
const { registerRoutes } = require('./routes');
const { registerHealthChecks } = require('./health');

function createApp({ config, httpClient, db, logger, nextHandler } = {}) {
  if (!config) {
    // eslint-disable-next-line global-require
    config = require('../config');
  }

  const app = express();

  configureMiddleware(app, { config, logger });
  registerRoutes(app, { config, httpClient, db, logger, nextHandler });
  registerHealthChecks(app, { config, db, logger });

  return app;
}

module.exports = { createApp };
