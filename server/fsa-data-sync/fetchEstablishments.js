const config = require('../../config/env');
const path = require('path');
const fs = require('fs');
const db = require('../db'); // Database connection module
const queryPath = path.join(__dirname, 'getEstablishments.sql');
const { testDatabaseConnection } = require('../tests/testDatabaseConnection');

// Function to fetch establishments from the database
const fetchEstablishments = async () => {

    //check database connection
    testDatabaseConnection();

    try {
        const query = await fs.promises.readFile(queryPath, 'utf-8');
        const res = await db.query(query);

        // Log the first 5 establishments in development mode
        if (config.nodeEnv === 'development') {
            // console.log('Establishments:', res.rows.slice(0, 5));
        }
    } catch (err) {
        console.error(`Error fetching establishments from query at ${queryPath}:`, err.message);
        throw err;
    }
};
module.exports = fetchEstablishments;