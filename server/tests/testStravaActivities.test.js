/**
 * testStravaActivitiesRoute.test.js
 *
 * Tests the /api/strava route (which in turn calls getStravaActivitiesFromDB).
 * We assume the server is already running on http://localhost:5000/api/strava.
 *
 * Usage:
 * 1. In one terminal: `npm start` (or however you start your server).
 *    It must listen on port 5000, with app.use('/api/strava', stravaRoute).
 * 2. In another terminal: `npm test -- testStravaActivitiesRoute.test.js`
 *    (or just `npm test` if you want to run all tests).
 */

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const axios = require('axios');
const db = require('../db');

// Base URL for the /api/strava route
const BASE_URL = 'http://localhost:5000/api/strava';

describe('Strava Activities Route Tests', () => {
  // Optional: Set up or seed data in the DB before tests
  beforeAll(async () => {
    // Example: Insert mock rows if needed, or do nothing
  });

  // Clean up: end the DB pool (so Jest won't complain about open handles)
  afterAll(async () => {
    await db.end();
  });

  test("GET /api/strava should return an array of activities", async () => {
    const response = await axios.get(BASE_URL);
    // console.log("Received data from /api/strava:", response.data);
  
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true); // <-- fails if response.data isn't an array
  

    // Optionally assert on the structure of each activity
    // if (response.data.length > 0) {
    //   expect(response.data[0]).toHaveProperty('id');
    //   expect(response.data[0]).toHaveProperty('name');
    // }
  });
});
