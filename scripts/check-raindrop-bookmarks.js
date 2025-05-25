#!/usr/bin/env node

// Load environment configuration
require('../config/env');
const db = require('../server/db');

async function checkRaindropBookmarks(userId) {
  try {
    console.log(`Checking Raindrop bookmarks for user: ${userId}`);
    
    // Check tokens first
    const tokenResult = await db.query(
      'SELECT * FROM raindrop.tokens WHERE user_id = $1',
      [userId]
    );
    
    console.log('\nToken status:', {
      hasTokens: tokenResult.length > 0,
      expiresAt: tokenResult[0]?.expires_at,
      isExpired: tokenResult[0]?.expires_at ? new Date(tokenResult[0].expires_at) < new Date() : null
    });
    
    // Check bookmarks
    const bookmarkResult = await db.query(
      'SELECT * FROM raindrop.bookmarks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );
    
    console.log(`\nFound ${bookmarkResult.length} bookmarks`);
    
    if (bookmarkResult.length > 0) {
      console.log('\nSample bookmarks:');
      bookmarkResult.forEach((bookmark, index) => {
        console.log(`${index + 1}. ${bookmark.title}`);
        console.log(`   URL: ${bookmark.link}`);
        console.log(`   Tags: ${bookmark.tags || 'none'}`);
        console.log(`   Created: ${bookmark.created_at}`);
        console.log('');
      });
    }
    
    // Check collections
    const collectionResult = await db.query(
      'SELECT * FROM raindrop.collections WHERE user_id = $1',
      [userId]
    );
    
    console.log(`Found ${collectionResult.length} collections`);
    if (collectionResult.length > 0) {
      console.log('\nCollections:');
      collectionResult.forEach(col => {
        console.log(`- ${col.title} (ID: ${col.raindrop_id})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking bookmarks:', error);
    process.exit(1);
  }
}

// Get user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('Usage: node scripts/check-raindrop-bookmarks.js <user-id>');
  console.error('Example: node scripts/check-raindrop-bookmarks.js 95288f22-6049-4651-85ae-4932ededb5ab');
  process.exit(1);
}

checkRaindropBookmarks(userId); 