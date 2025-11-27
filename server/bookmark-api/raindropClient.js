const { createHttpClient } = require('../http/client');
const config = require('../../config/env');

const raindropHttpClient = createHttpClient({
  baseURL: config.raindrop.baseUrl,
  config: config.http,
});

module.exports = { raindropHttpClient };
