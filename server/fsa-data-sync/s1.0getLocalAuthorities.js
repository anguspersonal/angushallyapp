const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const {testDatabaseConnection} = require('../testDatabaseConnection.js');

// Load environment variables before importing the database module
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const db = require('../db.js'); // Database connection module

//Test the database connection
testDatabaseConnection();

/**
 * Fetches the URLs for Open Data files from the Food Hygiene Rating Scheme (FHRS) API
 * and inserts or updates local authority data in the PostgreSQL database.
 */
async function getLocalAuthorities() {
    try {
        console.log('Fetching local authorities data from FHRS API...');

        const response = await axios.get('https://api.ratings.food.gov.uk/Authorities', {
            headers: {
                'x-api-version': '2',
                'accept': 'application/json',
            },
        });

        const authorities = response.data.authorities;

        console.log(`Found ${authorities.length} local authorities.`);

        for (const authority of authorities) {
            const localAuthorityId = parseInt(authority.LocalAuthorityId, 10); //as $1
            const name = authority.Name; // Official name
            const friendlyName = authority.FriendlyName; // Simplified name
            const url = authority.FileName; // URL for Open Data file
            const metadata = authority; // Full metadata as JSONB
            const status = "Pending"; // as $6


            // SQL query to insert or update local authority data
            const query = `
                INSERT INTO fsa.local_authorities (local_authority_id, name, friendly_name, url, metadata, processing_status)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (local_authority_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    friendly_name = EXCLUDED.friendly_name,
                    url = EXCLUDED.url,
                    metadata = EXCLUDED.metadata,
                    processing_status = EXCLUDED.processing_status;
            `;
            const values = [localAuthorityId, name, friendlyName, url, metadata, status];

            await db.query(query, values);

            console.log(`Processed local authority: ${name} (${localAuthorityId})`);
        }

        console.log('Fetched and stored Local Authorities and the URLs of associated Establishment data xml files in database.');
    } catch (error) {
        console.error('Error fetching and storing Open Data URLs:', error.message);
        throw error;
    }
}

// Run the function
getLocalAuthorities()
    .then(() => console.log("Script executed successfully"))
    .catch((error) => console.error("Error executing script:", error));
