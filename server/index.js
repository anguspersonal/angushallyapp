const express = require('express');
const path = require('path');
const { Client } = require('pg');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const axios = require('axios'); // Add axios for API calls
const Fuse = require('fuse.js'); // Import Fuse.js for fuzzy search
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); // Load environment variables
const db = require('./db'); // Import the database module

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

console.log('TEST_VAR:', process.env.TEST_VAR);

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });

} else {
  const app = express();

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

  // Route to fetch food hygiene scores
  app.get('/api/hygiene-score', async (req, res) => {
    const { name, address } = req.query;

    if (!name || !address) {
        return res.status(400).json({ error: 'Name and address are required query parameters.' });
    }

    try {
        // Fetch establishments from the UK Food Hygiene Ratings API
        const response = await axios.get('https://api.ratings.food.gov.uk/establishments', {
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


  // Single route to handle dynamic queries
  app.get('/api/db/:table', async (req, res) => {
    const table = req.params.table;
    let queryText;
    switch (table) {
      case 'posts': queryText = 'SELECT * FROM public.posts ORDER BY id ASC';
        break;
        // Add more cases for different tables or queries 
      default: res.status(400).json({ error: 'Invalid table name' });
        return;
    } try {
      const result = await db.query(queryText);
      res.json(result);
    } catch (err) {
      console.error('Database query error: ', err);
      res.status(500).json({ error: 'Database query error', message: err.message });
    }
  });

  // Answer API requests.
  app.get('/api', function (req, res) {
    res.set('Content-Type', 'application/json');
    res.send('{"message":"Hello from the custom server!"}');
  });

  // All remaining requests return the React app, so it can handle routing.
  app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
  });

  app.listen(PORT, function () {
    console.error(`Node ${isDev ? 'dev server' : 'cluster worker ' + process.pid}: listening on port ${PORT}`);
  });
}
