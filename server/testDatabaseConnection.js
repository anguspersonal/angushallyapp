const dotenv = require('dotenv');
const path = require('path');

// Load environment variables before importing the database module
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const db = require('./db.js'); // Database connection module

// Function to test database connection
const testDatabaseConnection = async () => {
    try {
        await db.query('SELECT 1;');
        console.log('Database connection is working');
        return true; // Return true for success
    } catch (error) {
        console.error('Database connection error:', error);
        return false; // Return false for failure
    }
};

module.exports = testDatabaseConnection;