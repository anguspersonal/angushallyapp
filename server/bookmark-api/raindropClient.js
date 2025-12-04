const { createHttpClient } = require('../http/client');
const config = require('../../config/env');

const raindropHttpClient = createHttpClient({
  baseURL: config.raindrop.baseUrl,
  config: config.http,
});

const raindropOAuthHttpClient = createHttpClient({
  baseURL: config.raindrop.oauthBaseUrl,
  config: config.http,
});

module.exports = { raindropHttpClient, raindropOAuthHttpClient };
