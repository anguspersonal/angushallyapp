const config = require('../config');
const { createHttpClient } = require('../http/client');
const { createApp } = require('./createApp');

function createServer() {
  const httpClient = createHttpClient({ config: config.http, logger: console });
  return createApp({ config, httpClient });
}

function startServer(app = createServer()) {
  const PORT = config.server.port;
  const isDev = config.nodeEnv !== 'production';
  return app.listen(PORT, () => {
    console.log(`Node ${isDev ? 'dev server' : 'server'} listening on port ${PORT}`);
  });
}

module.exports = { createServer, startServer };
