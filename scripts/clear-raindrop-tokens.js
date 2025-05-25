#!/usr/bin/env node

// Load environment configuration
require('../config/env');
const db = require('../server/db');

async function clearRaindropTokens(userId) {
  try {
    console.log(`Clearing Raindrop tokens for user: ${userId}`);
    
    // Delete tokens from the database
    const result = await db.query(
      'DELETE FROM raindrop.tokens WHERE user_id = $1',
      [userId]
    );
    
    console.log(`Deleted ${result.rowCount} token record(s)`);
    
    // Verify deletion
    const checkResult = await db.query(
      'SELECT * FROM raindrop.tokens WHERE user_id = $1',
      [userId]
    );
    
    if (checkResult.length === 0) {
      console.log('✅ Tokens successfully cleared');
    } else {
      console.log('❌ Tokens still exist in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing tokens:', error);
    process.exit(1);
  }
}

// Get user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('Usage: node scripts/clear-raindrop-tokens.js <user-id>');
  console.error('Example: node scripts/clear-raindrop-tokens.js 95288f22-6049-4651-85ae-4932ededb5ab');
  process.exit(1);
}

clearRaindropTokens(userId); 