const fuse = require('fuse.js');

const fuseThresholdLevels = async () => {
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
    return fuseThresholdLevels;
};
module.exports = fuseThresholdLevels;
