const config = require('../config');
const { createHttpClient } = require('../http/client');
const { createApp } = require('./createApp');
const { attachNext } = require('./next');
const { createLogger } = require('../observability/logger');

function createServer({ withNext = true } = {}) {
  const logger = createLogger({ service: 'api-server', environment: config.nodeEnv });
  const httpClient = createHttpClient({ config: config.http, logger: logger.child({ component: 'http-client' }) });
  const app = createApp({ config, httpClient, logger });

  if (withNext) {
    attachNext(app);
  }

  return app;
}

function startServer({ app, withNext } = {}) {
  const serverApp = app || createServer({ withNext });
  const PORT = config.server.port;
  const isDev = config.nodeEnv !== 'production';
  return serverApp.listen(PORT, () => {
    const logger = serverApp?.logger || createLogger({ service: 'api-server', environment: config.nodeEnv });
    logger.info('server:listening', { port: PORT, nodeEnv: config.nodeEnv, isDev });
  });
}

module.exports = { createServer, startServer };
