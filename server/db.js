/**
 * @module db
 * @description Database Connection and Query Module for PostgreSQL.
 *
 * Establishes a PostgreSQL connection pool (via `pg` package) using configuration
 * from `../config/env.js`. Exports utility functions for executing SQL queries.
 *
 * Key Exports:
 *   - `query(text: string, params?: any[], retries?: number): Promise<any[]>`
 *   - `select(table: string, allowedTables: Record<string,string[]>, filters?: Record<string,any>, columns?: string[]): Promise<any[]>`
 *   - `end(): Promise<void>`
 *   - `pool: pg.Pool`
 *
 * IMPORTANT: The query function returns the rows array directly, not the full pg result object.
 * This means you should access results like this:
 *   const users = await db.query('SELECT * FROM users');
 *   const firstUser = users[0];  // NOT users.rows[0]
 *
 * @example
 * // Correct usage:
 * const results = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
 * const user = results[0];  // Access first row directly
 * 
 * // Incorrect usage:
 * const results = await db.query('SELECT * FROM users');
 * const user = results.rows[0];  // Wrong! Results is already the rows array
 *
 * @see {@link ../config/env.js|Environment Configuration}
 * @see {@link https://node-postgres.com/|node-postgres documentation}
 * @author Angus Hally
 * @version 1.3.0
 * @since 2025-02-28
 * @updated 2025-05-24 - Inlined config from env.js and removed dbConfig dependency.
 */

const { Pool } = require('pg');
const config = require('../config/env');

// Determine pool configuration based on environment
const poolConfig = config.database.url
  ? {
      connectionString: config.database.url,
      ssl: { rejectUnauthorized: false },
      searchPath: config.database.searchPath,
    }
  : {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      searchPath: config.database.searchPath,
    };

// Singleton pool instance
let pool;

/**
 * Gets or creates the PostgreSQL connection pool instance.
 * @returns {import('pg').Pool} The database pool instance
 */
function getPool() {
  if (!pool) {
    pool = new Pool(poolConfig);

    // Set up connection initialization
    pool.on('connect', async (client) => {
      try {
        // Set the search path for each new connection
        const searchPath = config.database.searchPath.join(', ');
        await client.query(`SET search_path TO ${searchPath}`);
        
        // Get current database name
        const dbResult = await client.query('SELECT current_database()');
        const dbName = dbResult.rows[0].current_database;
        
        // console.log('DB Pool: Connected to PostgreSQL using config:', {
        //   environment: config.nodeEnv,
        //   connectionType: poolConfig.connectionString ? 'DATABASE_URL' : 'Direct Connection',
        //   database: dbName,
        //   searchPath: searchPath
        // });
      } catch (err) {
        // console.error('Error setting search path:', err);
      }
    });

    pool.on('error', (err) => {
      // console.error('DB Pool: Unexpected error on idle client', err);
      process.exit(-1);
    });

    // Handle process termination signals
    const cleanup = async () => {
      // console.log('Cleaning up database connections...');
      try {
        await end();
        // console.log('Database connections closed.');
        process.exit(0);
      } catch (err) {
        // console.error('Error during cleanup:', err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGUSR2', cleanup); // For Nodemon restart
    process.on('beforeExit', cleanup);
    process.on('exit', () => {
      if (pool) {
        // console.log('Process exiting, closing pool sync');
        pool.end();
      }
    });
  }
  return pool;
}

/**
 * Helper function to safely quote PostgreSQL identifiers (table names, column names).
 * Handles schema-qualified identifiers like "schema.table" by quoting each part.
 * @param {string} identifier - The identifier to quote.
 * @returns {string} The quoted identifier.
 */
const quoteIdent = (identifier) => {
  return identifier
    .split('.')
    .map(part => `"${part.replace(/"/g, '""')}"`)
    .join('.');
};

/**
 * Executes a SQL query against the database with retry logic.
 * Returns only the rows from the result.
 * @async
 * @function query
 * @param {string} text - The SQL query string.
 * @param {any[]} [params=[]] - An array of parameters for the SQL query.
 * @param {number} [retries=3] - The number of times to retry the query on failure.
 * @returns {Promise<any[]>} A promise that resolves to an array of result rows.
 * @throws {Error} If the query fails after all retries.
 */
const query = async (text, params = [], retries = 3) => {
  // console.log('Executing query:', { text, params });
  const client = await getPool().connect();
  try {
    // Verify search path
    const searchPathResult = await client.query('SHOW search_path');
    // console.log('Current search path:', searchPathResult.rows[0].search_path);
    
    // console.log('Got client from pool, executing query...');
    const res = await client.query(text, params);
    // console.log('Query completed successfully, row count:', res.rowCount);
    return res.rows;
  } catch (error) {
    // console.error('Database query error:', {
    //   error: error.message,
    //   stack: error.stack,
    //   query: text,
    //   params,
    //   retries_left: retries
    // });

    if (retries > 0) {
      // console.log('DB Pool: Retrying query...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return query(text, params, retries - 1);
    }
    throw error;
  } finally {
    // console.log('Releasing client back to pool');
    client.release();
  }
};

/**
 * Ends the connection pool.
 * @function end
 * @returns {Promise<void>} A promise that resolves when the pool has ended.
 */
const end = async () => {
  if (pool) {
    const p = pool;
    pool = null;
    await p.end();
  }
};

/**
 * Constructs and executes a dynamic, safe SELECT query.
 * Validates table and column names against an allowed list.
 * @async
 * @function select
 * @param {string} table - The name of the table to select from. Can be schema-qualified (e.g., 'public.my_table').
 * @param {Record<string, string[]>} allowedTables - An object where keys are table names (can be schema-qualified) and values are arrays of allowed column names for that table.
 * @param {Record<string, any>} [filters={}] - An object representing WHERE clause filters (e.g., { column_name: value }).
 * @param {string[]} [columns=['*']] - An array of column names to select. Defaults to all columns.
 * @returns {Promise<any[]>} A promise that resolves to an array of result rows.
 * @throws {Error} If the table name is invalid or if the query fails.
 */
const select = async (table, allowedTables, filters = {}, columns = ['*']) => {
  if (!allowedTables[table]) {
    throw new Error(`Invalid table name or table not in allowed list: ${table}`);
  }

  const allowedColumnsForTable = allowedTables[table];
  let effectiveColumns = columns;

  if (columns.length === 1 && columns[0] === '*') {
    effectiveColumns = allowedColumnsForTable;
  } else {
    effectiveColumns = columns.filter(col => allowedColumnsForTable.includes(col));
    if (effectiveColumns.length === 0 && columns[0] !== '*') {
      throw new Error(`No valid columns selected for table ${table}. Requested: ${columns.join(', ')}. Allowed: ${allowedColumnsForTable.join(', ')}`);
    }
  }

  const selectedColumnsSQL = effectiveColumns.map(quoteIdent).join(', ');
  const safeTableSQL = quoteIdent(table);

  let queryText = `SELECT ${selectedColumnsSQL} FROM ${safeTableSQL}`;
  const queryParams = [];
  const filterKeys = Object.keys(filters);

  if (filterKeys.length > 0) {
    const conditions = filterKeys.map((key, index) => {
      if (!allowedColumnsForTable.includes(key)) {
        throw new Error(`Filter key "${key}" is not an allowed column for table "${table}".`);
      }
      queryParams.push(filters[key]);
      return `${quoteIdent(key)} = $${index + 1}`;
    });
    queryText += ` WHERE ${conditions.join(' AND ')}`;
  }

  if (allowedColumnsForTable.includes('created_at')) {
    queryText += ` ORDER BY ${quoteIdent('created_at')} DESC`;
  } else if (allowedColumnsForTable.includes('id')) {
    queryText += ` ORDER BY ${quoteIdent('id')} ASC`;
  }

  return await query(queryText, queryParams);
};

module.exports = { query, select, end, pool: getPool() };
