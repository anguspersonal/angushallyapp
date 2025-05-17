const config = require('../../config/env');

/**
 * @fileoverview Database configuration module.
 * Generates the appropriate PostgreSQL connection pool configuration
 * based on the NODE_ENV environment variable.
 */

function getDatabaseConfig() {
  if (config.nodeEnv === 'production') {
    // Prefer DATABASE_URL if available (Heroku standard)
    if (config.database.url) {
      return {
        connectionString: config.database.url,
        ssl: {
          rejectUnauthorized: false
        }
      };
    }

    // Fall back to detailed production config if DATABASE_URL is not available
    const prodConfig = config.database.production;
    if (!prodConfig.host || !prodConfig.name || !prodConfig.user || !prodConfig.password) {
      throw new Error('Missing required production database configuration');
    }

    return {
      host: prodConfig.host,
      port: prodConfig.port,
      database: prodConfig.name,
      user: prodConfig.user,
      password: prodConfig.password,
      ssl: {
        rejectUnauthorized: false
      },
      searchPath: prodConfig.searchPath
    };
  }

  // Development configuration
  const devConfig = config.database.development;
  if (!devConfig.host || !devConfig.name || !devConfig.user) {
    throw new Error('Missing required development database configuration');
  }

  return {
    host: devConfig.host,
    port: devConfig.port,
    database: devConfig.name,
    user: devConfig.user,
    password: devConfig.password,
    ssl: false,
    searchPath: devConfig.searchPath
  };
}

module.exports = getDatabaseConfig(); 