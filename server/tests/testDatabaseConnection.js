const dotenv = require('dotenv');
const path = require('path');

// Load environment variables before importing the database module
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// console.log("DEBUG: DATABASE_URL is", process.env.DATABASE_URL);

const db = require('../db.js'); // Database connection module

// Function to test database connection
const testDatabaseConnection = async () => {
    try {
        // Test the connection by querying the database
        console.log('Running test query...');
        // console.log("DEBUG: DATABASE_URL is", process.env.DATABASE_URL);
        await db.query('SELECT 1;');
        console.log('Database connection is working, test result:');
        return true; // Return true for success
    } catch (error) {
        console.error('Database connection error:', error);
        throw error; // Rethrow the error for the caller
    }
};

module.exports = { testDatabaseConnection };

// Test the database connection
// testDatabaseConnection();