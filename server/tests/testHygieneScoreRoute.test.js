const config = require('../../config/env');
/**
 * testHygieneScoreRoute.test.js
 *
 * Tests the hygieneScoreRoute.js, which is currently mounted at
 * app.use('/api/hygieneScoreRoute', hygieneScoreRoute);
 *
 * and the router path is router.post('/api/hygieneScoreRoute', ...)
 *
 * That yields a final route of:
 *  POST /api/hygieneScoreRoute/api/hygieneScoreRoute
 *
 * We'll call exactly that endpoint, passing a "places" array.
 *
 * Usage:
 * 1. In one terminal: `npm start` (server must be on port 5000)
 * 2. In another: `npm test -- testHygieneScoreRoute.test.js`
 */

const path = require('path');

const axios = require('axios');
const db = require('../db'); // if you want to close the pool

describe("Hygiene Score Route Tests", () => {
  afterAll(async () => {
    await db.end();
  });

  test("POST /api/hygieneScoreRoute -> should return matched results", async () => {
    // This route expects req.body.places to be an array
    // We'll supply a dummy array of place objects
    const samplePlaces = [
        {
          "place_id": "ChIJiVvjYX0FdkgR8wbzgP3ygJ0",
          "name": "Gaucho Covent Garden",
          "address": "8-9 James St, London WC2E 8BT, UK",
          "postcode": "WC2E 8BT",
          "latitude": 51.5128231,
          "longitude": -0.12352710000000001
        },
        {
          "place_id": "ChIJ9RQEoMsEdkgR7j7ThuwfQ7A",
          "name": "Balthazar",
          "address": "4-6 Russell St, London WC2B 5HZ, UK",
          "postcode": "WC2B 5HZ",
          "latitude": 51.512397899999996,
          "longitude": -0.1213613
        },
        {
          "place_id": "ChIJD5A_MR0FdkgRQLrU9b-GChE",
          "name": "Inca London",
          "address": "8-9 Argyll St, London W1F 7TF, UK",
          "postcode": "W1F 7TF",
          "latitude": 51.5109,
          "longitude": -0.1345
        },
        {
          "place_id": "ChIJoXFa5vgbdkgRebVFAjgNcOs",
          "name": "Cavo Restaurant London",
          "address": "The Now Building, Outernet, Denmark St, London WC2H 0LA, UK",
          "postcode": "WC2H 0LA",
          "latitude": 51.5158164,
          "longitude": -0.12948969999999999
        },
        {
          "place_id": "ChIJsbCv5dIEdkgRB2bizkL45vA",
          "name": "Old Compton Brasserie",
          "address": "1 Old Compton St, London W1D 4TT, UK",
          "postcode": "W1D 4TT",
          "latitude": 51.5132226,
          "longitude": -0.1314747
        },
        {
          "place_id": "ChIJyeTsrLoFdkgRdsewS8ne0fQ",
          "name": "Blacklock Covent Garden",
          "address": "16A Bedford St, London WC2E 9HE, UK",
          "postcode": "WC2E 9HE",
          "latitude": 51.510698299999994,
          "longitude": -0.12459160000000001
        },
        {
          "place_id": "ChIJqRED6isbdkgRCT80mnwGaVU",
          "name": "Salt Yard",
          "address": "54 Goodge St, London W1T 4NA, UK",
          "postcode": "W1T 4NA",
          "latitude": 51.519185099999994,
          "longitude": -0.1365124
        },
        {
          "place_id": "ChIJnVf83AIbdkgR054D55weEBY",
          "name": "Colonel Saab, High Holborn",
          "address": "16 High Holborn, London WC1V 7BD, UK",
          "postcode": "WC1V 7BD",
          "latitude": 51.5169661,
          "longitude": -0.12264979999999999
        },
        {
          "place_id": "ChIJr_4cVy8FdkgRIrNbO93eUFM",
          "name": "The Wolseley",
          "address": "160 Piccadilly, London W1J 9EB, UK",
          "postcode": "W1J 9EB",
          "latitude": 51.5074427,
          "longitude": -0.1409233
        },
        {
          "place_id": "ChIJHdd94hwbdkgRihDCyn0FD1Y",
          "name": "Tattu London",
          "address": "30 The Market, London WC2H 0LA, UK",
          "postcode": "WC2H 0LA",
          "latitude": 51.515384999999995,
          "longitude": -0.1295445
        }
      ]
      ;

    const url = "http://localhost:5000/api/hygieneScoreRoute";
    const response = await axios.post(url, { places: samplePlaces });
    // console.log("Received data from /api/hygieneScoreRoute:", response.data);

    expect(response.status).toBe(200);
    // If your matchGPlacesToFSAEstab returns an array or object, adjust your expectations
    // For example, if it returns an array of matches:
    expect(Array.isArray(response.data)).toBe(true);
  });

  test("POST /api/hygieneScoreRoute -> invalid data returns 400", async () => {
    // If we pass something that isn't an array, the route sends status 400
    const invalidPayload = { places: "not an array" };

    try {
      const url = "http://localhost:5000/api/hygieneScoreRoute";
      await axios.post(url, invalidPayload);
      // If we get here, no error was thrown
      fail("Expected a 400 error for invalid input");
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toHaveProperty("error", "Invalid input: places should be an array");
    }
  });
});
