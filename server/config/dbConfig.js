const dotenv = require("dotenv");
dotenv.config({ path: require('path').resolve(__dirname, '../.env') }); // Ensure .env from server/ is loaded

/**
 * @fileoverview Database configuration module.
 * Generates the appropriate PostgreSQL connection pool configuration
 * based on the NODE_ENV environment variable.
 */

let poolConfig;

if (process.env.NODE_ENV === 'production') {
  console.log('DB Config: Using PRODUCTION settings (DATABASE_URL)');
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set for production.');
  }
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      require: true,
      rejectUnauthorized: false // Common for Heroku, but review for your specific prod SSL needs
    },
    connectionTimeoutMillis: 10000, // 10 seconds
    idleTimeoutMillis: 30000, // 30 seconds
    max: 10, // Maximum number of clients in the pool
    min: 2,  // Minimum number of clients in the pool
    acquireTimeoutMillis: 8000, // 8 seconds
    // Consider adding searchPath for production if needed, matching knexfile.js
    searchPath: ['public', 'identity', 'habit', 'crm', 'fsa', 'content']
  };
} else {
  // Development or other environments (e.g., test)
  console.log('DB Config: Using DEVELOPMENT settings (DEV_DB_HOST, etc.)');
  if (!process.env.DEV_DB_HOST || !process.env.DEV_DB_NAME || !process.env.DEV_DB_USER) {
    throw new Error('Missing one or more DEV_DB_ environment variables for development (DEV_DB_HOST, DEV_DB_NAME, DEV_DB_USER).');
  }
  poolConfig = {
    host: process.env.DEV_DB_HOST,
    port: process.env.DEV_DB_PORT || 5432,
    database: process.env.DEV_DB_NAME,
    user: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD, // Can be null if that's how your local PG is set up
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10,
    min: 2,
    // SSL typically not needed for local dev against WSL PG, unless you've configured it
    // Add searchPath for development, matching knexfile.js
    searchPath: process.env.DEV_DB_SEARCH_PATH ? process.env.DEV_DB_SEARCH_PATH.split(',') : ['public', 'identity', 'habit', 'crm', 'fsa', 'content']
  };
}

module.exports = poolConfig; 