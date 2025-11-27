const express = require('express');
const Fuse = require('fuse.js');
const { httpClient } = require('../http/client');

const router = express.Router();

router.get('/api/hygiene-score', async (req, res) => {
    const { name, address } = req.query;

    if (!name || !address) {
        return res.status(400).json({ error: 'Name and address are required query parameters.' });
    }

    try {
        // Fetch establishments from the UK Food Hygiene Ratings API
        const response = await httpClient.get('https://api.ratings.food.gov.uk/establishments', {
            headers: {
                'x-api-version': '2',
                'accept': 'application/json',
            },
            params: {
                name, // Restaurant name
                address, // Restaurant address
            },
        });

        const establishments = response.data.establishments;

        // If no establishments are found, return an error
        if (establishments.length === 0) {
            return res.status(404).json({ error: 'No hygiene score found for the specified name and address.' });
        }

        // Fuzzy matching using Fuse.js
        const fuse = new Fuse(establishments, {
            keys: ['BusinessName', 'AddressLine1', 'PostCode'],
            includeScore: true,
            threshold: 0.4, // Lower = stricter match
        });

        const searchResults = fuse.search(`${name} ${address}`);

        if (searchResults.length > 0) {
            // Return the best fuzzy match
            return res.json(searchResults[0].item);
        } else {
            // If no fuzzy match is found, return all establishments for debugging
            return res.status(300).json({ error: 'Multiple matches found but none are exact.', matches: establishments });
        }
    } catch (error) {
        console.error('Error fetching hygiene score:', error);
        res.status(500).json({ error: 'Failed to fetch hygiene score', message: error.message });
    }
});

module.exports = router;