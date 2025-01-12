const express = require('express');
const { matchGPlacesToFSAEstab } = require('../fsa-data-sync/matchGPlacesToFSAEstab');
const router = express.Router();

router.post('/api/hygieneScoreRoute', async (req, res) => {
    const places = req.body.places; // Directly access the array
    // console.log('Received places:', places);

    if (!Array.isArray(places)) {
        return res.status(400).json({ error: 'Invalid input: places should be an array' });
    }

    try {
        const result = await matchGPlacesToFSAEstab(places);
        console.log('Result from matchGPlacesToFSAEstab:', result);
        res.json(result); // Correctly send the result as JSON
    } catch (error) {
        console.error('Error performing lookup:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

module.exports = router;