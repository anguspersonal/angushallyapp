const config = require('../config');
const { createHttpClient } = require('../http/client');
const { createApp } = require('./createApp');
const { attachNext } = require('./next');

function createServer({ withNext = true } = {}) {
  const httpClient = createHttpClient({ config: config.http, logger: console });
  const app = createApp({ config, httpClient });

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
    console.log(`Node ${isDev ? 'dev server' : 'server'} listening on port ${PORT}`);
  });
}

module.exports = { createServer, startServer };
