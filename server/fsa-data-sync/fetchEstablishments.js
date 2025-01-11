const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const db = require('../db'); // Database connection module
const queryPath = path.join(__dirname, 'getEstablishments.sql');
const testDatabaseConnection = require('../testDatabaseConnection');

//check database connection
testDatabaseConnection(); 

// Function to fetch establishments from the database
const fetchEstablishments = async () => {
    try {
        const query = await fs.promises.readFile(queryPath, 'utf-8');
        const res = await db.query(query);

        // Log the first 5 establishments in development mode
        if (process.env.NODE_ENV === 'development') {
            console.log('Establishments:', res.rows.slice(0, 5));
        }
    } catch (err) {
        console.error(`Error fetching establishments from query at ${queryPath}:`, err.message);
        throw err;
    }
};
module.exports = fetchEstablishments;