const express = require('express');
const cors = require('cors');


const app = express();
const path = require('path');
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());



// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/dist'))); // Adjust if your build directory is different

// Your API routes would go here
app.get('/api/some-route', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Fallback to serve the frontend app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});