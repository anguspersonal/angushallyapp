const express = require('express');
const db = require('../db'); // Import database functions

const router = express.Router();

// ✅ Define Allowed Tables & Their Columns (Prevents SQL Injection)
const allowedTables = {
  posts: ['id', 'title', 'content', 'created_at', 'slug', 'excerpt'],
  customers: ['id', 'name', 'email', 'created_at'],
  inquiries: ['id', 'customer_id', 'subject', 'message', 'created_at', 'status']
};

// ✅ GET API Route for Fetching Data from Any Allowed Table
router.get('/:table', async (req, res) => {
  const table = req.params.table;
  const filters = req.query;
  let columns = filters.columns ? filters.columns.split(',') : ['*']; // Ensure columns is an array
  delete filters.columns; // Remove columns from filters

  // ✅ Validate Table Name
  if (!allowedTables[table]) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  // ✅ Validate Requested Columns
  const allowedColumns = allowedTables[table];
  const filteredColumns = columns.filter(col => allowedColumns.includes(col));

  if (filteredColumns.length === 0) {
    // Default to all allowed columns if invalid columns were requested
    columns = allowedColumns;
  } else {
    columns = filteredColumns;
  }

  try {
    const result = await db.select(table, allowedTables, filters, columns);
    res.json(result);
  } catch (err) {
    console.error('❌ Database query error:', err);
    res.status(500).json({ error: 'Database query error', message: err.message });
  }
});

module.exports = router;
