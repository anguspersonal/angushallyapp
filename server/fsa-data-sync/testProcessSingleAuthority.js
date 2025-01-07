require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Load environment variables
const processSingleAuthority = require('./processSingleAuthority.js');

// Define the test input 
const localAuthorityID = 1;
const name = "cambridge-city";
const url = "https://ratings.food.gov.uk/OpenDataFiles/FHRS027en-GB.xml";
// // Call the processSingleAuthority function with the test input 
(async () => {
    try {
        const result = await processSingleAuthority({localAuthorityID, name, url});
        console.log(`Result for ${name}:`, result);
    } catch (error) {
        console.error(`Error processing ${name}:`, error.message);
    }
})();