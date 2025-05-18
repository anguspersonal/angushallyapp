const config = require('../config/env');
const db = require('./db');

// --- Optional: More robust debug connection --- 
// This debug connection will now more reliably use the centralized config.
let directPgClient;
if (config.nodeEnv === 'development' || process.env.KNEX_DEBUG_CONNECT === 'true') {
  const pg = require('pg');
  directPgClient = new pg.Client({
    host: config.database.development.host,
    port: config.database.development.port,
    database: config.database.development.name,
    user: config.database.development.user,
    password: config.database.development.password
  });

  directPgClient.connect()
    .then(() => console.log('KNEXFILE_DEBUG: Connected via direct pg.'))
    .then(() => directPgClient.query('SELECT current_schema()'))
    .then(res => console.log('KNEXFILE_DEBUG: current_schema():', res.rows[0].current_schema))
    .then(() => directPgClient.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'knex_migrations' AND table_schema = 'public');"))
    .then(res => console.log('KNEXFILE_DEBUG: public.knex_migrations exists (direct pg): ', res.rows[0].exists))
    .then(() => directPgClient.end().then(() => console.log('KNEXFILE_DEBUG: Direct pg client disconnected.')))
    .catch(err => {
      console.error('KNEXFILE_DEBUG: Error in direct pg client connection or query:', err);
      if (directPgClient) directPgClient.end();
    });
}
// --- End of Optional Debug Block ---

// Debug queries using our db module
const debugQueries = async () => {
  const schemaResult = await db.query('SELECT current_schema()');
  console.log('KNEXFILE_DEBUG: current_schema():', schemaResult[0].current_schema);

  const tableResult = await db.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'knex_migrations')");
  console.log('KNEXFILE_DEBUG: public.knex_migrations exists (using db module): ', tableResult[0].exists);
};

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: config.database.development.host,
      port: config.database.development.port,
      database: config.database.development.name,
      user: config.database.development.user,
      password: config.database.development.password,
      searchPath: config.database.development.searchPath
    },    
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
      loadExtensions: ['.js']
    },
    seeds: {
      directory: './seeds'
    },
    debug: true,
    log: {
      warn(message) { console.warn('Knex Warning:', message); },
      error(message) { console.error('Knex Error:', message); },
      deprecate(message) { console.warn('Knex Deprecation:', message); },
      debug(message) { console.log('Knex Debug:', message); }
    }
  },

  production: {
    client: 'postgresql',
    connection: config.database.url ? {
      connectionString: config.database.url,
      ssl: {
        rejectUnauthorized: false
      },
      searchPath: config.database.production.searchPath
    } : {
      host: config.database.production.host,
      port: config.database.production.port,
      database: config.database.production.name,
      user: config.database.production.user,
      password: config.database.production.password,
      ssl: {
        rejectUnauthorized: false
      },
      searchPath: config.database.production.searchPath
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
      loadExtensions: ['.js']
    },
    seeds: {
      directory: './seeds'
    }
  }
};
 