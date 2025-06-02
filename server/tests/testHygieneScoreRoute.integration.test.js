const config = require('../../config/env');
/**
 * testHygieneScoreRoute.integration.test.js
 *
 * Integration tests for the hygieneScoreRoute.js, which is mounted at
 * app.use('/api/hygieneScoreRoute', hygieneScoreRoute);
 *
 * These tests make real HTTP requests to a running server and use real database connections.
 * They verify end-to-end functionality.
 *
 * The route path is simply '/', so the final route is:
 *  POST /api/hygieneScoreRoute
 *
 * We'll call this endpoint, passing a "places" array.
 *
 * Usage:
 * 1. In one terminal: `npm start` (server must be on port 5000)
 * 2. In another: `npm test -- testHygieneScoreRoute.integration.test.js`
 */

const path = require('path');
const axios = require('axios');
const db = require('../db'); // if you want to close the pool

// Mock the database before any imports
jest.mock('../db', () => ({
    query: jest.fn(),
    end: jest.fn(),
    pool: {
        connect: jest.fn()
    }
}));

// Mock the correct hygiene lookup service
jest.mock('../fsa-data-sync/matchGPlacesToFSAEstab', () => ({
    matchGPlacesToFSAEstab: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const { matchGPlacesToFSAEstab } = require('../fsa-data-sync/matchGPlacesToFSAEstab');
const hygieneScoreRoute = require('../routes/hygieneScoreRoute');

// Set test environment
process.env.NODE_ENV = 'test';

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
    app.use('/api/hygieneScoreRoute', hygieneScoreRoute);
});

beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Set default successful mock behavior
    matchGPlacesToFSAEstab.mockResolvedValue([]);
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
 * Hygiene Score Route Integration Tests
 * ────────────────────────────────────────────────────────────────────────────
 */
describe("Hygiene Score Route Integration Tests", () => {
  test("POST /api/hygieneScoreRoute -> invalid data returns 400 (Integration)", async () => {
    const invalidPayload = {
      places: "invalid_data_structure" // Should be an array
    };

    const response = await request(app)
      .post('/api/hygieneScoreRoute')
      .send(invalidPayload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid input: places should be an array");
    // Should not call lookup for invalid input
    expect(matchGPlacesToFSAEstab).not.toHaveBeenCalled();
  });

  test("POST /api/hygieneScoreRoute -> empty places array (Integration)", async () => {
    const emptyPayload = {
      places: []
    };

    // Mock successful lookup for empty array
    matchGPlacesToFSAEstab.mockResolvedValueOnce([]);

    const response = await request(app)
      .post('/api/hygieneScoreRoute')
      .send(emptyPayload);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
    expect(matchGPlacesToFSAEstab).toHaveBeenCalledWith([]);
  });

  test("POST /api/hygieneScoreRoute -> valid places data (Integration)", async () => {
    const validPayload = {
      places: [
        {
          place_id: "test123",
          name: "Test Restaurant",
          geometry: {
            location: {
              lat: 51.5074,
              lng: -0.1278
            }
          }
        }
      ]
    };

    const mockResults = [
      {
        place_id: "test123",
        name: "Test Restaurant",
        rating: 5,
        rating_date: "2023-01-01",
        local_authority_name: "City of London",
        business_type: "Restaurant/Cafe/Canteen"
      }
    ];

    // Mock successful lookup
    matchGPlacesToFSAEstab.mockResolvedValueOnce(mockResults);

    const response = await request(app)
      .post('/api/hygieneScoreRoute')
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('place_id', 'test123');
    expect(response.body[0]).toHaveProperty('rating', 5);
    expect(matchGPlacesToFSAEstab).toHaveBeenCalledWith(validPayload.places);
  });

  test("POST /api/hygieneScoreRoute -> database error handling (Integration)", async () => {
    const validPayload = {
      places: [
        {
          place_id: "test123",
          name: "Test Restaurant"
        }
      ]
    };

    // Mock service error
    matchGPlacesToFSAEstab.mockRejectedValueOnce(new Error('Database connection failed'));

    const response = await request(app)
      .post('/api/hygieneScoreRoute')
      .send(validPayload);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Failed to perform search');
    expect(matchGPlacesToFSAEstab).toHaveBeenCalledWith(validPayload.places);
  });
}); 