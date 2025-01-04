const axios = require('axios');

const dotenv = require('dotenv');

const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);

const db = require('../db.js'); // Database connection module

// Test database connection
(async () => {
    try {
        await db.query('SELECT 1;');
        console.log('Database connection is working');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); // Exit the process if the database connection fails
    }
})();

/**
 * Fetches the URLs for Open Data files from the Food Hygiene Rating Scheme (FHRS) API
 * and inserts local authority data into the PostgreSQL database.
 */
const fetchOpenDataUrls = async () => {
    try {
        const response = await axios.get('https://api.ratings.food.gov.uk/Authorities', {
            headers: {
                'x-api-version': '2',
                'accept': 'application/json',
            },
        });

        const authorities = response.data.authorities;

        for (const authority of authorities) {
            const localAuthority = authority.Name;
            const url = authority.FileName;
            const metadata = authority;

            const query = `
                INSERT INTO fsa.local_authorities (name, url, metadata)
                VALUES ($1, $2, $3)
                ON CONFLICT (name) DO UPDATE SET
                url = EXCLUDED.url,
                metadata = EXCLUDED.metadata;
            `;
            const values = [localAuthority, url, metadata];

            await db.query(query, values);
        }

        console.log('Fetched and stored Open Data URLs with metadata in the database.');
    } catch (error) {
        console.error('Error fetching and storing Open Data URLs:', error);
        throw error;
    }
};

// Run the function
fetchOpenDataUrls()
    .then(() => console.log("Script executed successfully"))
    .catch((error) => console.error("Error executing script:", error));
