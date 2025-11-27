const config = require('./config');
const { createHttpClient } = require('./http/client');
const { createApp } = require('./bootstrap/createApp');

function startServer() {
  const httpClient = createHttpClient({ config: config.http, logger: console });
  const app = createApp({ config, httpClient });
  const PORT = config.server.port;
  const isDev = config.nodeEnv !== 'production';

  return app.listen(PORT, () => {
    console.log(`Node ${isDev ? 'dev server' : 'server'} listening on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
