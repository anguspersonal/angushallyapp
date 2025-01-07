require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Load environment variables
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser'); // Library for parsing XML
const db = require('../db'); // Database connection module
const fs = require('fs'); 
const path = require('path');
const query = fs.readFileSync(path.join(__dirname, 'query.txt'), 'utf-8');

const processSingleAuthority = async (props) => {
    console.log({props});   
    const { localAuthorityID, name, url } = props;
    const sanitisedname = name.replace(/[^a-zA-Z0-9]/g, '');
    console.log(`${localAuthorityID}, ${name}, ${url}`);
    
    // 1 Get the XML data from the FSA API for the given url
    console.log(`Processing: ${name}, fetching data from: ${url}`);
    const response = await axios.get(url, {responseType: 'text'});
    const xmldata = response.data;
    
    if (!xmldata) {
        console.log(`No data returned for ${name}`);
        return false;
    }
    
    console.log (`Successfully fetched data for ${name}`);
    // 2 Parse the XML data to JSON
    const parser = new XMLParser();
    const parsedData = parser.parse(xmldata);

    if (!parsedData) {
        console.log(`Failed to parse data for ${name}`);
        return false;
    }
    console.log(`Successfully parsed data for ${name}`);

    // Extract establishments from the parsed data
    const establishments = parsedData.FHRSEstablishment.EstablishmentCollection.EstablishmentDetail || [];
    console.log(`Found ${establishments.length} establishments for ${name}`);

    // Log the first establishment for debugging
    console.log(establishments[0], establishments[1], establishments[2]);

    // 3 Perform processes and validation on data

    // 4 Save the data to the database

    // 5 if all is successful return true

};

// Export the function
module.exports = processSingleAuthority;