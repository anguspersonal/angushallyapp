const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Load environment variables

router.get('/api/google-places-details', async (req, res) => {
    const { place_id } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        // console.log('Place details:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching place details:', error);
        res.status(500).json({ error: 'Failed to fetch place details' });
    }
});

module.exports = router;