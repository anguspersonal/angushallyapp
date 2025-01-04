console.log('DATABASE_URL in db.js:', process.env.DATABASE_URL);

// db.js (Database Module)
const { Pool } = require('pg');

// Log the database URL for debugging (avoid in production)
console.log('Connecting to database:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const query = async (text, params = []) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  query,
};
