//console.log('Executing matchGPlacesToFSAEstab.js - V_LATEST_DEBUG_01');
const config = require('../../config/env');
const path = require('path'); // Import the path module
const Fuse = require('fuse.js');

// const { testDatabaseConnection } = require('../tests/testDatabaseConnection');
const searchMatchingPostcode = require('./searchMatchingPostcode');
const fuseThresholdLevels = require('./fuseThresholdLevels');

/**
 * Function to take an array of Google places with id, name, address, postcode
 * Then runs searchMatchingPostcode to get establishments with matching postcodes
 * Then runs performFuzzySearch to get the best match for each
 * place using name and address
 * 
 * With resulting list of establishments, search for a match with 
 * name and address - for each place
 * If no match found return null
 * Return the best match
 * Return array of best matches, objects with id and rating
 */

const matchGPlacesToFSAEstab = async (places) => {

    // Check database connection
    // testDatabaseConnection();

    // Match places with establishments based on postcodes efficiently by batching.
    const estsMatchingPostcode = await searchMatchingPostcode(places);

    // If no match found return null
    if (!estsMatchingPostcode || estsMatchingPostcode.length === 0) {
        console.log('No matching postcodes found');
        return null;
    }

    const thresholds = await fuseThresholdLevels();
    // THRESHOLDS: Define the threshold levels to use for the search
    const selectedFuseThresholdLevel = {
        postcodeThreshold: thresholds[3], // High strictness
        nameAndAddressThreshold: thresholds[9] // Very lenient
    };

    // For each place, search for a matching address
    const keys = ['business_name', 'address']; // Define the keys to use for the fuzzy search
    const results = await performFuzzySearch(keys, places, estsMatchingPostcode, selectedFuseThresholdLevel);
    // console.log(`Results: ${JSON.stringify(results, null, 2)}`);

    // Get the result of establishments from address search, then for each place, search for a matching name
    return results;

};

// FUZZY SEARCH: The `performFuzzySearch` function performs a fuzzy search on a list of places using the establishments list
const performFuzzySearch = async (keys, places, establishments, selectedFuseThresholdLevel) => {
    const results = [];
    // console.log(`looking up places: ${JSON.stringify(places[0], null, 2)}`);
    // Validate and log establishments
    establishments.forEach(establishment => {
        if (!establishment.address) {
            console.error('Invalid establishment address:', establishment);
        }
    });

    const validEstablishments = establishments.filter(establishment => establishment.address);
    // console.log(`Valid establishments: `,validEstablishments);

    const searchNameAndAddress = new Fuse(validEstablishments,
        {
            keys: keys,
            threshold: selectedFuseThresholdLevel.nameAndAddressThreshold.value, // Moderate threshold
        });

    for (const place of places) {
        const result = searchNameAndAddress.search({
            business_name: place.name,
            address: place.address
        });
        // console.log(`Search result for place ${place.name}, ${place.formatted_address}:`, result);
        if (result && result.length > 0) {
            const bestMatch = result[0].item;
            const returnPlace = { ...place, ...bestMatch };
            results.push(returnPlace);
            // console.log(`Matched: ${place.name} with ${bestMatch.business_name} Rating: ${bestMatch.rating_value_str}`);
        }
    }

    // Calculate the number of matches
    if (results.length > 0) {
        const numberPlacesSearched = places.length;
        const numberMatches = results.length;
        const percentageMatch = (numberMatches / numberPlacesSearched) * 100;
        const thresholdValues = Object.values(selectedFuseThresholdLevel);
        const thresholdSum = thresholdValues.reduce((sum, item) => sum + item.value, 0);
        const averageStrictness = Math.round(10 * thresholdSum / thresholdValues.length) / 10;
        console.log(`#Places: ${numberPlacesSearched} #Matches:${numberMatches} Matched:${percentageMatch}% Search Strictness ${averageStrictness}`);
        // console.log(results);
    }
    return results;
};

module.exports = { matchGPlacesToFSAEstab };