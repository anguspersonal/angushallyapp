const config = require('../../config/env');
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

const path = require('path');

const axios = require('axios');
const db = require('../db');

// Base URL for the /api/strava route
const BASE_URL = 'http://localhost:5000/api/strava';

// Mock the database before any imports
jest.mock('../db', () => ({
    query: jest.fn(),
    end: jest.fn(),
    pool: {
        connect: jest.fn()
    }
}));

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
    authMiddleware: () => {
        return (req, res, next) => {
            req.user = {
                id: '95288f22-6049-4651-85ae-4932ededb5ab',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                roles: ['member']
            };
            next();
        };
    }
}));

// Mock the correct Strava module
jest.mock('../strava-api/getActivitesFromDB', () => jest.fn());

const request = require('supertest');
const express = require('express');
const getStravaActivitiesFromDB = require('../strava-api/getActivitesFromDB');
const stravaRoute = require('../routes/stravaRoute');

// Set test environment
process.env.NODE_ENV = 'test';

// Mock user for testing
const TEST_USER = {
    id: '95288f22-6049-4651-85ae-4932ededb5ab',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['member']
};

/* 
 * ────────────────────────────────────────────────────────────────────────────
 * Test Setup and Teardown
 * ────────────────────────────────────────────────────────────────────────────
 */
let app;

beforeAll(async () => {
    // Setup Express app for testing
    app = express();
    app.use(express.json());
    
    // Mock auth middleware - inject user into request
    app.use((req, res, next) => {
        req.user = TEST_USER;
        next();
    });
    
    app.use('/api/strava', stravaRoute);
});

beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Set default successful mock behavior
    getStravaActivitiesFromDB.mockResolvedValue([]);
});

afterEach(async () => {
    // Clear mocks after each test
    jest.clearAllMocks();
});

afterAll(async () => {
    // No cleanup needed for mocked tests
});

/*
 * ────────────────────────────────────────────────────────────────────────────
 * Strava Activities Route Tests
 * ────────────────────────────────────────────────────────────────────────────
 */
describe("Strava Activities Route Tests", () => {
  test("GET /api/strava should return an array of activities", async () => {
    const mockActivities = [
      {
        id: 1,
        name: "Morning Run",
        type: "Run",
        distance: 5000,
        moving_time: 1800,
        elapsed_time: 1900,
        total_elevation_gain: 50,
        start_date: "2023-01-01T08:00:00Z",
        sport_type: "Run"
      },
      {
        id: 2,
        name: "Evening Bike Ride",
        type: "Ride",
        distance: 15000,
        moving_time: 2700,
        elapsed_time: 3000,
        total_elevation_gain: 150,
        start_date: "2023-01-02T18:00:00Z",
        sport_type: "Ride"
      }
    ];

    // Mock successful activities fetch
    getStravaActivitiesFromDB.mockResolvedValueOnce(mockActivities);

    const response = await request(app)
      .get('/api/strava');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('name', 'Morning Run');
    expect(response.body[0]).toHaveProperty('type', 'Run');
    expect(response.body[1]).toHaveProperty('name', 'Evening Bike Ride');
    expect(response.body[1]).toHaveProperty('type', 'Ride');
    expect(getStravaActivitiesFromDB).toHaveBeenCalledTimes(1);
  });

  test("GET /api/strava should return empty array when no activities", async () => {
    // Mock empty activities response
    getStravaActivitiesFromDB.mockResolvedValueOnce([]);

    const response = await request(app)
      .get('/api/strava');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
    expect(getStravaActivitiesFromDB).toHaveBeenCalledTimes(1);
  });

  test("GET /api/strava should handle service errors gracefully", async () => {
    // Mock service error
    getStravaActivitiesFromDB.mockRejectedValueOnce(new Error('Strava API unavailable'));

    const response = await request(app)
      .get('/api/strava');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Failed to fetch Strava data');
    expect(getStravaActivitiesFromDB).toHaveBeenCalledTimes(1);
  });
});
