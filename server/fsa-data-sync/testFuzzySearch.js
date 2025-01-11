const { performFuzzySearch } = require('./fuzzySearch');

// Example data
const places = [
    {
        name: "The Old Thai House",
        addressline1: "1-2 Whitfield Street",
        postcode: "W1T 1JY"
    },
    {
        name: "Thai Metro",
        addressline1: "11-24 Whitfield Street",
        postcode: "W1T 1JY"
    }
];

const establishments = [
    {
        name: "Old Thai House",
        addressline1: "1-2 Whitfield Street",
        postcode: "W1T1JY",
        rating: 5
    },
    {
        name: "Thai Metro",
        addressline1: "11-24 Whitfield Street",
        postcode: "W1T1JY",
        rating: 4
    }
];

const selectedFuseThresholdLevel = {
    name: { value: 0.4 },
    addressline1: { value: 0.4 },
    postcode: { value: 0.4 }
};

(async () => {
    try {
        const results = await performFuzzySearch(places, establishments, selectedFuseThresholdLevel);
        console.log('Fuzzy Search Results:', results);
    } catch (error) {
        console.error('Error performing fuzzy search:', error);
    }
})();