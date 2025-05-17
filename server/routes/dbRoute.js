/* dbRoute.js - Express Router for Database Query Endpoints

This module defines an Express router that provides an HTTP GET 
endpoint to fetch data from specified 
database tables using the functions provided in db.js.

Key Features: 
- Specifies a set of allowed tables and their permitted columns to ensure security against SQL injection. 
- Extracts the table name from the URL and query parameters for filters and column selection. It validates these parameters against the allowed list. 
- Invokes the select() function from db.js to perform safe, dynamic SELECT queries. 
- Handles errors by returning appropriate HTTP status codes and error messages.

Route: 
- GET /:table: Fetches data from the designated table with optional filters and column selections specified via query parameters.

Usage: 
- Mount this router in your main server file (e.g., index.js) under an API path such as /api/db.

References: - Express documentation: https://expressjs.com/

Author: Angus Hally Date: 11/02/2025 */


const express = require('express');
const db = require('../db'); // Import database functions

const router = express.Router();

// ✅ Define Allowed Tables & Their Columns (Prevents SQL Injection)
const allowedTables = {
  'content.posts': [
    'id', 
    'title', 
    'author_id', // Now UUID, links to identity.users
    'content', 
    'content_md', 
    'excerpt', 
    'slug', 
    'tags',
    'metadata',
    'cover_image', 
    'alt_text', 
    'attribution', 
    'attribution_link', 
    'created_at', // Now TIMESTAMPTZ
    'updated_at'  // Now TIMESTAMPTZ
  ],
  'content.authors': [
    'id',       // UUID, PK, links to identity.users
    'name', 
    'created_at', // Now TIMESTAMPTZ
    'updated_at'  // Now TIMESTAMPTZ
  ],
  'crm.inquiries': [
    'id',
    'submitter_user_id',
    'name',
    'email',
    'subject',
    'message',
    'captcha_token',
    'status',
    'assigned_to_user_id',
    'created_at',
    'updated_at'
  ]
  // Add other tables here if they need to be exposed via this generic route
};

// ✅ GET API Route for Fetching Data from Any Allowed Table
router.get('/:table', async (req, res) => {
  const table = req.params.table;
  const filters = req.query;
  
  let columns = filters.columns ? filters.columns.split(',') : ['*'];
  delete filters.columns;

  // ✅ Validate Table Name
  if (!allowedTables[table]) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  // ✅ Validate Requested Columns
  const allowedColumns = allowedTables[table];
  const filteredColumns = columns.filter(col => allowedColumns.includes(col));

  if (filteredColumns.length === 0) {
    columns = allowedColumns;
  } else {
    columns = filteredColumns;
  }

  try {
    const result = await db.select(table, allowedTables, filters, columns);
    res.json(result);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error', message: err.message });
  }
});

module.exports = router;
