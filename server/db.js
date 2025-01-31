const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Generic query function (handles ALL SQL queries)
const query = async (text, params = [], retries = 3) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;  // ✅ Only returning rows, NOT an object with { rows: [...] }
  } catch (error) {
    console.error('Database query error:', error);
    if (retries > 0) {
      console.log(`Retrying query (${retries} retries left)...`);
      return query(text, params, retries - 1);
    } else {
      throw error;
    }
  } finally {
    client.release();
  }
};

// ✅ High-level function for selecting records (uses `query()`)
const select = async (table, allowedTables, filters = {}, columns = ['*']) => {
  // Validate table name
  if (!allowedTables[table]) {
    throw new Error(`Invalid table name: ${table}`);
  }

  // Validate requested columns
  const allowedColumns = allowedTables[table];
  const selectedColumns = columns.every(col => allowedColumns.includes(col))
    ? columns.join(', ')
    : allowedColumns.join(', ');

  // Construct dynamic query with filters
  let queryText = `SELECT ${selectedColumns} FROM public.${table}`;
  const queryParams = [];
  const conditions = Object.keys(filters).map((key, index) => {
    if (!allowedColumns.includes(key)) return null; // Prevent SQL Injection
    queryParams.push(filters[key]);
    return `${key} = $${index + 1}`;
  }).filter(Boolean);

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(' AND ')}`;
  }

  queryText += ` ORDER BY id ASC`;

  // ✅ Use `query()` internally
  return await query(queryText, queryParams);
};

module.exports = { query, select };
