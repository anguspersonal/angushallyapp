require('dotenv').config();

// --- Optional: More robust debug connection --- 
// This debug connection will now more reliably use your .env variables.
// It's still good practice to move this to a separate script for non-debug runs.
let directPgClient;
if (process.env.NODE_ENV === 'development' || process.env.KNEX_DEBUG_CONNECT === 'true') {
  const pg = require('pg');
  directPgClient = new pg.Client({
    host: process.env.DEV_DB_HOST,     // Directly from .env
    port: process.env.DEV_DB_PORT,
    database: process.env.DEV_DB_NAME,
    user: process.env.DEV_DB_USER,       // Directly from .env
    password: process.env.DEV_DB_PASSWORD // Directly from .env
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

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host     : process.env.DEV_DB_HOST,
      port     : process.env.DEV_DB_PORT,
      database : process.env.DEV_DB_NAME,
      user     : process.env.DEV_DB_USER,
      password : process.env.DEV_DB_PASSWORD,
      searchPath: ['public', 'identity', 'habit', 'crm', 'fsa'] // 'public' first for knex tables
    },    
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations', // Corrected: Just the table name
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
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      searchPath: ['public', 'identity', 'habit', 'crm', 'fsa'] // Corrected to camelCase and public first
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations', // Corrected: Just the table name
      loadExtensions: ['.js']
    },
    seeds: {
      directory: './seeds'
    }
  }
};
 