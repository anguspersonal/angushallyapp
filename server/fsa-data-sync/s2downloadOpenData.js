const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Load environment variables before importing the database module
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const db = require('../db'); // Database connection module

// Directory for storing XML files
const DATA_DIR = path.resolve(__dirname, '../fsa-establishment-data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Fetches local authorities from the database.
 * @ returns {Promise<Array>} An array of objects with `id`, `name`, and `url`.
 */
const fetchLocalAuthorities = async () => {
    try {
        console.log('Fetching local authorities from the database...');
        const query = `
            SELECT local_authority_id, name, url
            FROM fsa.local_authorities
            WHERE url IS NOT NULL;
        `;
        const localAuthorities = await db.query(query);
        console.log(`Found ${localAuthorities.length} local authorities.`);
        return localAuthorities;
    } catch (error) {
        console.error('Error fetching local authorities:', error.message);
        throw error;
    }
};

/**
 * Downloads XML data and saves it to a local file.
 * @ param {Object} authority - An object containing `id`, `name`, and `url`.
 */
const downloadAndSaveXML = async (authority) => {
    const { local_authority_id, name, url } = authority;
    const sanitizedName = name.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${local_authority_id}${sanitizedName}.xml`;
    const filePath = path.join(DATA_DIR, fileName);

    try {
        console.log(`Downloading XML data for ${name} from ${url}...`);
        const response = await axios.get(url, { responseType: 'text' });
        const xmlData = response.data;

        // Write the XML data to a file
        fs.writeFileSync(filePath, xmlData);
        console.log(`Saved XML data to ${filePath}`);
    } catch (error) {
        console.error(`Error downloading or saving data for ${name}:`, error.message);
    }
};

/**
 * Main function to download XML files for all local authorities.
 */
const downloadOpenData = async () => {
    try {
        // Fetch local authorities from the database
        const localAuthorities = await fetchLocalAuthorities();

        // Process each local authority
        for (const authority of localAuthorities) {
            await downloadAndSaveXML(authority);
        }

        console.log('All XML files have been downloaded and saved.');
    } catch (error) {
        console.error('Error in downloadOpenData:', error.message);
    }
};

// Run the script
downloadOpenData();
