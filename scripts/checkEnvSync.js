#!/usr/bin/env node

/**
 * Environment Sync Checker
 * 
 * Verifies consistency between dev and prod environments for critical schema and data states.
 * Run this script manually before any deploy to production to catch issues like:
 * - Drifted database schemas (missing tables, columns)
 * - Missing essential data (empty tables in prod)
 * - Diverging migration versions or incomplete seed data
 * 
 * Usage: node scripts/checkEnvSync.js
 * 
 * Requires environment variables:
 * - DATABASE_URL (for production database)
 * - DEV_DATABASE_URL or local DB config (for development database)
 */

const { Pool } = require('pg');
const config = require('../config/env');

// Track check results
let checkResults = [];
let hasFailures = false;
let hasWarnings = false;

/**
 * Log check result with appropriate formatting
 */
function logResult(status, message, details = null) {
  const prefix = {
    'OK': '✅ [OK]',
    'WARN': '⚠️  [WARN]',
    'FAIL': '❌ [FAIL]'
  }[status];
  
  console.log(`${prefix} ${message}`);
  if (details) {
    console.log(`    ${details}`);
  }
  
  checkResults.push({ status, message, details });
  
  if (status === 'FAIL') hasFailures = true;
  if (status === 'WARN') hasWarnings = true;
}

/**
 * Create database connection pool for a specific environment
 */
function createPool(envName, connectionConfig) {
  const poolConfig = connectionConfig.url
    ? {
        connectionString: connectionConfig.url,
        ssl: { rejectUnauthorized: false },
        searchPath: connectionConfig.searchPath,
      }
    : {
        host: connectionConfig.host,
        port: connectionConfig.port,
        database: connectionConfig.name,
        user: connectionConfig.user,
        password: connectionConfig.password,
        searchPath: connectionConfig.searchPath,
      };

  const pool = new Pool(poolConfig);
  
  pool.on('connect', async (client) => {
    try {
      const searchPath = connectionConfig.searchPath.join(', ');
      await client.query(`SET search_path TO ${searchPath}`);
    } catch (err) {
      console.error(`Error setting search path for ${envName}:`, err);
    }
  });

  return pool;
}

/**
 * Execute query with error handling
 */
async function executeQuery(pool, envName, query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    logResult('FAIL', `Query failed in ${envName}`, `${error.message} | Query: ${query}`);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check if table exists in the given environment
 */
async function checkTableExists(pool, envName, schemaName, tableName) {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = $2
      );
    `;
    const result = await executeQuery(pool, envName, query, [schemaName, tableName]);
    return result[0].exists;
  } catch (error) {
    logResult('FAIL', `Failed to check table existence in ${envName}`, `${schemaName}.${tableName}`);
    return false;
  }
}

/**
 * Get row count for a table
 */
async function getRowCount(pool, envName, schemaName, tableName) {
  try {
    const query = `SELECT COUNT(*) as count FROM "${schemaName}"."${tableName}";`;
    const result = await executeQuery(pool, envName, query);
    return parseInt(result[0].count);
  } catch (error) {
    logResult('FAIL', `Failed to get row count in ${envName}`, `${schemaName}.${tableName}`);
    return -1;
  }
}

/**
 * Get latest entry timestamp for a table
 */
async function getLatestTimestamp(pool, envName, schemaName, tableName, timestampColumn = 'created_at') {
  try {
    const query = `SELECT MAX("${timestampColumn}") as latest FROM "${schemaName}"."${tableName}";`;
    const result = await executeQuery(pool, envName, query);
    return result[0].latest;
  } catch (error) {
    // This might fail if table is empty or column doesn't exist, which is okay
    return null;
  }
}

/**
 * Get migration status
 */
async function getMigrationStatus(pool, envName) {
  try {
    const query = `SELECT name FROM knex_migrations ORDER BY id DESC LIMIT 10;`;
    const result = await executeQuery(pool, envName, query);
    return result.map(row => row.name);
  } catch (error) {
    logResult('FAIL', `Failed to get migration status in ${envName}`, error.message);
    return [];
  }
}

/**
 * Main sync checking function
 */
async function checkEnvSync() {
  console.log('🔍 Environment Sync Checker Starting...\n');
  
  // Setup database connections
  const devConfig = {
    host: config.database.host,
    port: config.database.port,
    name: config.database.name,
    user: config.database.user,
    password: config.database.password,
    searchPath: config.database.searchPath,
  };
  
  const prodConfig = {
    url: process.env.PROD_DATABASE_URL || process.env.DATABASE_URL,
    searchPath: config.database.searchPath,
  };
  
  if (!prodConfig.url) {
    logResult('FAIL', 'Production database URL not found', 'Set PROD_DATABASE_URL or DATABASE_URL');
    return;
  }
  
  let devPool, prodPool;
  
  try {
    devPool = createPool('dev', devConfig);
    prodPool = createPool('prod', prodConfig);
    
    console.log('📊 Checking Database Connections...');
    
    // Test connections
    try {
      await executeQuery(devPool, 'dev', 'SELECT 1');
      logResult('OK', 'Dev database connection successful');
    } catch (error) {
      logResult('FAIL', 'Dev database connection failed', error.message);
      return;
    }
    
    try {
      await executeQuery(prodPool, 'prod', 'SELECT 1');
      logResult('OK', 'Prod database connection successful');
    } catch (error) {
      logResult('FAIL', 'Prod database connection failed', error.message);
      return;
    }
    
    console.log('\n📋 Checking Table Existence...');
    
    // Check bookmarks.bookmarks table exists in both environments
    const devBookmarksExists = await checkTableExists(devPool, 'dev', 'bookmarks', 'bookmarks');
    const prodBookmarksExists = await checkTableExists(prodPool, 'prod', 'bookmarks', 'bookmarks');
    
    if (devBookmarksExists && prodBookmarksExists) {
      logResult('OK', 'Table exists in both environments: bookmarks.bookmarks');
    } else if (!devBookmarksExists && !prodBookmarksExists) {
      logResult('WARN', 'Table missing in both environments: bookmarks.bookmarks');
    } else {
      logResult('FAIL', 'Table existence mismatch: bookmarks.bookmarks', 
        `Dev: ${devBookmarksExists ? 'exists' : 'missing'}, Prod: ${prodBookmarksExists ? 'exists' : 'missing'}`);
    }
    
    console.log('\n📊 Checking Row Counts...');
    
    // Check raindrop.bookmarks row counts
    const devRaindropCount = await getRowCount(devPool, 'dev', 'raindrop', 'bookmarks');
    const prodRaindropCount = await getRowCount(prodPool, 'prod', 'raindrop', 'bookmarks');
    
    if (devRaindropCount >= 0 && prodRaindropCount >= 0) {
      logResult('OK', `Row counts - raindrop.bookmarks`, `Dev: ${devRaindropCount}, Prod: ${prodRaindropCount}`);
      
      if (devRaindropCount > 0 && prodRaindropCount === 0) {
        logResult('WARN', 'Prod has no raindrop bookmarks while dev has data');
      }
    }
    
    // Check bookmarks.bookmarks row counts (if tables exist)
    if (devBookmarksExists && prodBookmarksExists) {
      const devBookmarksCount = await getRowCount(devPool, 'dev', 'bookmarks', 'bookmarks');
      const prodBookmarksCount = await getRowCount(prodPool, 'prod', 'bookmarks', 'bookmarks');
      
      if (devBookmarksCount >= 0 && prodBookmarksCount >= 0) {
        logResult('OK', `Row counts - bookmarks.bookmarks`, `Dev: ${devBookmarksCount}, Prod: ${prodBookmarksCount}`);
        
        if (devBookmarksCount > 0 && prodBookmarksCount === 0) {
          logResult('WARN', 'Prod has no canonical bookmarks while dev has data', 'Consider running bookmark sync in prod');
        }
      }
      
      // Check latest timestamps
      console.log('\n⏰ Checking Latest Entry Timestamps...');
      
      const devLatest = await getLatestTimestamp(devPool, 'dev', 'bookmarks', 'bookmarks');
      const prodLatest = await getLatestTimestamp(prodPool, 'prod', 'bookmarks', 'bookmarks');
      
      if (devLatest && prodLatest) {
        const devDate = new Date(devLatest);
        const prodDate = new Date(prodLatest);
        const timeDiff = Math.abs(devDate - prodDate) / (1000 * 60 * 60 * 24); // days
        
        if (timeDiff < 7) {
          logResult('OK', 'Latest entries are recent in both environments', 
            `Dev: ${devDate.toISOString()}, Prod: ${prodDate.toISOString()}`);
        } else {
          logResult('WARN', 'Large time gap between latest entries', 
            `Dev: ${devDate.toISOString()}, Prod: ${prodDate.toISOString()} (${timeDiff.toFixed(1)} days apart)`);
        }
      } else if (!prodLatest && devLatest) {
        logResult('WARN', 'No recent entries in prod, but dev has data');
      }
    }
    
    console.log('\n🏗️  Checking Migration Status...');
    
    // Check migration status
    const devMigrations = await getMigrationStatus(devPool, 'dev');
    const prodMigrations = await getMigrationStatus(prodPool, 'prod');
    
    if (devMigrations.length > 0 && prodMigrations.length > 0) {
      const latestDev = devMigrations[0];
      const latestProd = prodMigrations[0];
      
      if (latestDev === latestProd) {
        logResult('OK', 'Migration versions match', `Latest: ${latestDev}`);
      } else {
        logResult('FAIL', 'Migration versions do not match', 
          `Dev: ${latestDev}, Prod: ${latestProd}`);
      }
      
      // Check if dev has migrations that prod doesn't
      const devOnly = devMigrations.filter(m => !prodMigrations.includes(m));
      if (devOnly.length > 0) {
        logResult('WARN', 'Dev has newer migrations than prod', `Pending: ${devOnly.join(', ')}`);
      }
    } else {
      logResult('FAIL', 'Could not retrieve migration status from one or both environments');
    }
    
  } catch (error) {
    logResult('FAIL', 'Unexpected error during sync check', error.message);
    console.error('Full error:', error);
  } finally {
    // Clean up connections
    if (devPool) await devPool.end();
    if (prodPool) await prodPool.end();
  }
  
  // Print summary
  console.log('\n📈 Summary:');
  const okCount = checkResults.filter(r => r.status === 'OK').length;
  const warnCount = checkResults.filter(r => r.status === 'WARN').length;
  const failCount = checkResults.filter(r => r.status === 'FAIL').length;
  
  console.log(`✅ Passed: ${okCount}`);
  console.log(`⚠️  Warnings: ${warnCount}`);
  console.log(`❌ Failures: ${failCount}`);
  
  if (hasFailures) {
    console.log('\n❌ SYNC CHECK FAILED - Production deployment is HIGH RISK');
    console.log('Please resolve failures before deploying to production.');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  SYNC CHECK PASSED WITH WARNINGS');  
    console.log('Review warnings before deploying to production.');
    process.exit(0);
  } else {
    console.log('\n✅ SYNC CHECK PASSED - Safe to deploy to production');
    process.exit(0);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the sync check
checkEnvSync().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 