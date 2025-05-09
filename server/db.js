/* db.js - Database Connection and Query Module

This module establishes a PostgreSQL connection pool using the 'pg' package and provides functions for executing SQL queries safely.

Key Functions: - query(text, params, retries): Executes parameterised SQL queries with error handling and retry logic, returning only the result rows. - select(table, allowedTables, filters, columns): Constructs a dynamic, safe SELECT query. It validates the table and column names against an allowed list to prevent SQL injection, applies filters and ordering, and executes the query via the query() function.

Environment Variables: - DATABASE_URL: Specifies the connection string for PostgreSQL. - SSL is configured with 'rejectUnauthorized' set to false.

Usage Example: const { query, select } = require('./db');

References: - PostgreSQL Node.js client documentation: https://node-postgres.com/

Author: Angus Hally Date: 2025-02-28 */

const dotenv = require("dotenv");
dotenv.config();
const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000, // 5 seconds
});

// ✅ Generic query function (handles ALL SQL queries)
const query = async (text, params = [], retries = 3) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;  // ✅ Return just the rows
  } catch (error) {
    console.error('Database query error:', error);
    if (retries > 0) {
      return query(text, params, retries - 1);
    }
    throw error;
  } finally {
    client.release();
  }
};

// ✅ Utility function to end the pool
const end = () => {
  return pool.end();
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

  // Add order by created_at if it exists in the columns
  if (allowedColumns.includes('created_at')) {
    queryText += ` ORDER BY created_at DESC`;
  } else {
    queryText += ` ORDER BY id ASC`;
  }

  // ✅ Use `query()` internally
  return await query(queryText, queryParams);
};

module.exports = { query, end, select };
