const express = require('express');
const path = require('path');
const { Client } = require('pg');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const axios = require('axios'); // Add axios for API calls
const Fuse = require('fuse.js'); // Import Fuse.js for fuzzy search
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); // Load environment variables
const db = require('./db'); // Import the database module
const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;
// console.log(process.env.NODE_ENV,process.env.PORT);

// console.log('TEST_VAR:', process.env.TEST_VAR);

const app = express();
// Use body-parsing middleware
app.use(express.json());

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

// Trust proxy for express rate limit to work correctly
app.set("trust proxy", 1);

// ✅ Apply rate limiting BEFORE defining API routes
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: {
    error: "Too many requests, please try again later.",
  },
});

app.use(globalLimiter); // 👈 Applied early before API routes

// 🟢 Stricter limit for the contact form
const contactLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Only 10 requests per minute per IP
  message: {
    error: "Too many contact form submissions, please try again later.",
  },
});

// Apply the stricter limit to the contact form
const contactRoute = require('./routes/contact');
// console.log("Contact route registered at /api/contact");
app.use('/api/contact', contactLimiter, contactRoute); // 👈 Applied only to contact route

// ✅ Single DB query route
const dbRoute = require('./routes/dbRoute'); // Import the database route
app.use('/api/db', dbRoute); // Mount the route

// ✅ Google Places API proxy route
const googlePlacesProxyRoute = require('./routes/googlePlacesProxy');
app.use(googlePlacesProxyRoute);

// ✅ Hygiene score route
const hygieneScoreRoute = require('./routes/hygieneScoreRoute');
app.use(hygieneScoreRoute);

// ✅ Strava API routes
const stravaRoute = require('./routes/stravaRoute');
app.use(stravaRoute);

// ✅ Habit API routes
const habitRoute = require('./routes/habitRoute');
app.use(habitRoute);

// ✅ Alcohol API routes
const alcoholRoute = require("./routes/alcohol");
app.use("/api/alcohol", alcoholRoute);


// Answer all other API requests.
app.get('/api', function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send('{"message":"Hello from the custom server!"}');
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

// Override addEventListener to enforce passive listeners
(function() {
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === "touchstart" || type === "wheel") {
      options = options instanceof Object ? { ...options, passive: true } : { passive: true };
    }
    originalAddEventListener.call(this, type, listener, options);
  };
})();


app.listen(PORT, function () {
  console.error(`Node ${isDev ? 'dev server' : 'cluster worker ' + process.pid}: listening on port ${PORT}`);
});
