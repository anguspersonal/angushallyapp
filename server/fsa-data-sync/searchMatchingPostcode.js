console.log('Executing searchMatchingPostcode.js - V_LATEST_DEBUG_01');
const config = require('../../config/env');
const db = require('../db'); // Database connection module
// const { testDatabaseConnection } = require('../tests/testDatabaseConnection');



/**
 * Match places with establishments based on postcodes efficiently by batching.
 * @param {Array<{name: string, address: string, postcode: string}>} places List of places
 * @returns {Object.<string, Array>} Dictionary of place names to matching establishments
 */
const searchMatchingPostcode = async (places) => {
    // Check database connection
    // testDatabaseConnection();


    // Log the places array to debug
    // console.log('Received places:', places);

    // Extract unique postcodes from places, filtering out undefined or null postcodes
    const uniquePostcodes = [...new Set(places.map(place => place.postcode).filter(pc => pc))];
    // console.log('Received uniquePostcodes:', uniquePostcodes);

    // Normalize postcodes by converting to lowercase and removing spaces
    const params = uniquePostcodes.map(pc => pc.toLowerCase().replace(/\s+/g, ''));

    // Check if params array is empty
    if (params.length === 0) {
        console.log('No valid postcodes found.');
        return [];
    }

    // Generate SQL placeholders for parameterized query
    const sqlPlaceholders = params.map((_, i) => `$${i + 1}`).join(', ');

    // Construct the SQL query to fetch establishments by postcode
    const queryEstabs = `
    SELECT 
        fsa.establishments.id,
        fsa.establishments.business_name,
        fsa.establishments.address,
        fsa.postcodes.postcode,
        fsa.establishments.rating_value_str,
        fsa.establishments.rating_value_num
    FROM fsa.postcodes
    JOIN fsa.establishments
    ON fsa.postcodes.postcode_id = fsa.establishments.postcode_id
    WHERE LOWER(REPLACE(fsa.postcodes.postcode, ' ', '')) IN (${sqlPlaceholders});
`;

    // console.log('Executing query:', queryEstabs);
    // console.log('With parameters:', params);


    try {
        const matches = await db.query(queryEstabs, params);
        // Log the entire query result
        // console.log('Query result:', matches);
        return matches; // Returns the matches array
    } catch (error) {
        console.error('Error executing query:', error);
        return [];
    }
}

module.exports = searchMatchingPostcode;