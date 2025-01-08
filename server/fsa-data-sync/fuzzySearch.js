require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const Fuse = require('fuse.js');

/**
 * This script demonstrates how to use the Fuse.js library to perform fuzzy search on a list of establishments
 * // For each place we want to find it's FSA health rating from the data in our database we downloaded in via the FSA API. For now we will use a dummy list of establishements
 * E.g. // Places may come from a result of a search query to a google places 
 * API e.g. "https://maps.googleapis.com/maps/api/place/textsearch/json?query=thai+restaurants+in+London"
    
 */

let places = [];
let establishments = [];
const isDev = process.env.NODE_ENV !== 'production';

// If in dev enviroment use the following dummy data to test the function and dummy establishments data
if (isDev) {
    console.log(isDev);
    // Dummy list of items (google places) to search 
    // with place.name, place.postcode and place.addressline1, place.addressline2 as keys
    places = [
        {
            name: "The Old Thai House",
            postcode: "W1T 1JY",
            addressline1: "1-2 Whitfield Street",
            addressline2: "Fitzrovia"
        },
        {
            name: "Thai Metro",
            postcode: "W1T 1JY",
            addressline1: "11-24 Whitfield Street",
            addressline2: "Fitzrovia"
        },
        {
            name: "Thai House Camden",
            postcode: "NW1 8AH",
            addressline1: "1-2 Old Street",
            addressline2: "Camden"
        }
    ];

    // Dummy Establishments data
    establishments = [
        // Here is a list of establishments with their FSA ratings
        {
            //Thai restaruant in Fitzrovia
            name: "Old Thai House", // name is different from the place name
            postcode: "W1T1JY", // postcode is different from the place postcode, it's missing a space
            addressline1: "1-2 Whitfield Street",
            addressline4: "Fitzrovia", // Addresslines do not match up.
            rating: 5
        },
        {
            //Thai restaruant in Fitzrovia with different name

            name: "Thai-Metro", // name is different from the place name
            postcode: "W1T1JT", // postcode is different from the place postcode, it's got a typo
            addressline1: "11-24 Whitfield Street",
            addressline4: "fitzrovia", // Addresslines do not match up. and not capitalised
            rating: 4
        },
        {
            // Thai restarunt in Camden with similar name to first
            name: "Thai House Camden", // name is different from the place name
            postcode: "NW1 8AH", // postcode matches the place postcode
            addressline1: "1-2 Old Street",
            addressline4: "Camden", // Addresslines do not match up.
            rating: 3
        }
    ];
    // Desired  of dummy data
    /* 
    [
        {
            place: {
                name: "The Old Thai House",
                postcode: "W1T 1JY",
                addressline1: "1-2 Whitfield Street",
                addressline2: "Fitzrovia"
                rating: 5
            },
            refIndex: 0
        },
        {
            place: {
                name: "Thai Metro",
                postcode: "W1T 1JY",
                addressline1: "1-2 Whitfield Street",
                addressline2: "Fitzrovia"
                rating: 4
            },
            refIndex: 1
        }
        {
            place: {
                name: "ThaiHouse Camden",
                postcode: "NW1 8AH",
                addressline1: "1-2 Old Street",
                addressline2: "Camden"
                rating: 3
            },
            refIndex: 2
        }
    ];
    */

} else {
    // In production mode, we will get the places from the google places API
    // and the establishments from the our database
}


// Define the threshold levels to use for the search
const fuseThresholdLevels = [
    {
        id: 1,
        value: 0,
        name: "Exact Match",
        description: "Only exact matches are allowed. No fuzziness is permitted."
    },
    {
        id: 2,
        value: 0.05,
        name: "Very Strict",
        description: "Allows minimal fuzziness. Matches may tolerate a single typo or character difference."
    },
    {
        id: 3,
        value: 0.1,
        name: "Strict",
        description: "Minor differences are tolerated, such as small typos or slight variations in text."
    },
    {
        id: 4,
        value: 0.2,
        name: "Moderate Strictness",
        description: "Allows slight mismatches, useful for handling minor spelling or formatting inconsistencies."
    },
    {
        id: 5,
        value: 0.3,
        name: "Moderate",
        description: "Balances strictness and leniency, tolerating small but noticeable differences."
    },
    {
        id: 6,
        value: 0.4,
        name: "Lenient",
        description: "Allows moderate differences, making it suitable for partial matches or significant typos."
    },
    {
        id: 7,
        value: 0.5,
        name: "Moderately Lenient",
        description: "Allows noticeable differences while still prioritising relevance."
    },
    {
        id: 8,
        value: 0.6,
        name: "Quite Lenient",
        description: "Tolerates significant differences, potentially matching loosely related terms."
    },
    {
        id: 9,
        value: 0.7,
        name: "Very Lenient",
        description: "Allows substantial differences, capturing loosely related items or concepts."
    },
    {
        id: 10,
        value: 0.8,
        name: "Extremely Lenient",
        description: "Matches terms with large discrepancies, favouring inclusiveness over precision."
    },
    {
        id: 11,
        value: 0.9,
        name: "Highly Inclusive",
        description: "Includes almost any item that shares a small amount of similarity with the query."
    },
    {
        id: 12,
        value: 1,
        name: "Maximum Fuzziness",
        description: "Matches everything in the dataset, regardless of similarity. Use with caution."
    }
];

// Select the threshold levels to use for the search
const selectedFuseThresholdLevel = {
    postcodeThreshold: fuseThresholdLevels[4], // Moderate strictness
    nameAndAddressThreshold: fuseThresholdLevels[5],
}

/** 
// Searching Logic
// Assuming postcode should be relatively precise, we will use this to do the first level of search with a threshold of 0.1 (lower thresholds are more strict) do demand a high level of precision
// We will then use name and address to do a second level of search
// Since the address lines to not match, e.g. line 2 vs line 4, we will create a composite address field to search on by combining all address lines
// We will then use the Fuse.js library to do the search
// We only want to show users 1 result per place, so we will only show the first result from the search
*/

// FUZZY SEARCH POST CODE: The `searchMatchingPostcode` function searches for establishments with a matching postcode using Fuse.js
const searchMatchingPostcode = async (place, establishments) => {
    const searchPostCode = new Fuse(establishments,
        {
            keys: ['postcode'],
            threshold: selectedFuseThresholdLevel.postcodeThreshold.value, // Lower threshold for better fuzzy matching
        });
    const results = searchPostCode.search(place.postcode.replace(/\s/g, '')); // Remove spaces for better match
    return results.map((result, index) => ({
        ...result.item,
        refIndex: index,
    }));
};


// COMBINE PLACE ADDRESS: Combines the address lines of a place into a single string
const combinePlaceAddressLines = (place) => {
    const address = `${place.addressline1} ${place.addressline2 || ''}`.trim();
    // console.log(`${place.name}: ${address}`);
    return { ...place, address };
}


// COMBINE ESTABLISHMENT ADDRESS: Combines the address lines of an establishment into a single string for easier comparison
const combineEstablishmentAddressLines = (establishment) => {
    const address = `${establishment.addressline1} ${establishment.addressline4 || ''}`.trim();
    // console.log(`${establishment.name}: ${address}`);
    return { ...establishment, address }; // Adds a new `address` property to the `establishment` object
};


// SECOND FUZZY SEARCH: The `searchMatchingNameAndAddress` function searches for establishments with matching name and address using Fuse.js
const searchMatchingNameAndAddress = async (place, establishments) => {
    const searchNameAndAddress = new Fuse(establishments,
        {
            keys: ['name', 'address'],
            threshold: selectedFuseThresholdLevel.nameAndAddressThreshold.value, // Moderate threshold
        });
    const results = searchNameAndAddress.search({
        name: place.name,
        address: place.address
    });
    return results;
}

//RUN BOTH SEARCHES: `searchMatchingPlace` function searches for a matching place in the establishments list
// by first matching the postcode and then matching the name and address.
const searchMatchingPlace = async (place, establishments) => {
    // Step 1: Add `address` property to `place`
    place = combinePlaceAddressLines(place);

    // Step 2: Postcode matching
    const matchingPostcode = await searchMatchingPostcode(place, establishments);
    if (matchingPostcode.length === 0) {
        console.log(`No matching postcode for place: ${place.name}`);
        return null;
    }

    // Step 3: Add `address` property to establishments
    const updatedEstablishments = matchingPostcode.map(combineEstablishmentAddressLines);

    //console.log(`Updated Establishments for ${place.name}:`, updatedEstablishments);

    // Step 4: Perform name and address matching
    const matchingNameAndAddress = await searchMatchingNameAndAddress(place, updatedEstablishments);
    if (matchingNameAndAddress.length === 0) {
        console.log(`No name/address match for ${place.name}`);
        return null;
    }

    // Step 5: Extract best match
    const bestMatch = matchingNameAndAddress[0].item;
    place = { ...place, rating: bestMatch.rating };

    return {
        place,
        refIndex: bestMatch.refIndex,
        bestMatch,
    };
};

// RUN SCRIPT
(async () => {
    for (const place of places) {
        const result = await searchMatchingPlace(place, establishments);
        // Step 6 Calculate the number of matches
        if (result) {
            const numberPlacesSearched = places.length;
            const numberMatches = Object.values(result).length;
            const percentageMatch = (numberMatches / numberPlacesSearched) * 100;
            const thresholdValues = Object.values(selectedFuseThresholdLevel);
            const thresholdSum = thresholdValues.reduce((sum, item) => sum + item.value, 0);
            const averageStrictness = thresholdSum / thresholdValues.length;
            console.log(result, `#Places: ${numberPlacesSearched} #Matches:${numberMatches} Matched:${percentageMatch}% Search Strictness ${averageStrictness}`);
        }
    }
})();
