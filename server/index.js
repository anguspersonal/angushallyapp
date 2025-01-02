const express = require('express');
const path = require('path');
const { Client } = require('pg');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); //Load environment variables from .env file
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

  // Reusable function to create and connect the client 
  const createClient = async () => {
    const client = new Client(
      { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false, }, });
    await client.connect();
    return client;
  };

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
