const express = require('express');
const router = express.Router();
const { analyzeText } = require('../ai-api/apiService');

router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    const analysis = await analyzeText(text);
    res.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});

module.exports = router; 