const config = require('../../config/env');
const path = require('path');
const request = require('supertest');
const db = require("../db");
const express = require('express');
const bookmarkRoute = require('../routes/bookmarkRoutes');

// Mock OpenGraph service
jest.mock('../bookmark-api/openGraph', () => ({
  fetchMetadata: jest.fn().mockResolvedValue({
    title: 'Test Title',
    description: 'Test Description',
    image: 'https://example.com/image.jpg',
    site_name: 'Example Site',
    resolved_url: 'https://example.com',
    error: null
  }),
  isValidUrl: (url) => url.startsWith('http://') || url.startsWith('https://')
}));

// Set test environment
process.env.NODE_ENV = 'test';

// Mock user for testing - using same test user ID as other tests
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
let server;
let dbPool;

beforeAll(async () => {
  // Initialize database connection
  dbPool = db;
  
  // Create test user
  await dbPool.query(`
    INSERT INTO identity.users (id, email, first_name, last_name, is_active)
    VALUES ($1, $2, $3, $4, true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      is_active = EXCLUDED.is_active
  `, [TEST_USER.id, TEST_USER.email, TEST_USER.firstName, TEST_USER.lastName]);

  // Create member role if it doesn't exist
  await dbPool.query(`
    INSERT INTO identity.roles (name)
    VALUES ('member')
    ON CONFLICT (name) DO NOTHING
    RETURNING id
  `);

  // Get role ID
  const roleResult = await dbPool.query('SELECT id FROM identity.roles WHERE name = $1', ['member']);
  const roleId = roleResult[0].id;

  // Link user to role
  await dbPool.query(`
    INSERT INTO identity.user_roles (user_id, role_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, role_id) DO NOTHING
  `, [TEST_USER.id, roleId]);

  // Setup Express app for testing
  app = express();
  app.use(express.json());
  
  // Mock auth middleware
  app.use((req, res, next) => {
    req.user = TEST_USER;
    next();
  });
  
  app.use('/api/bookmarks', bookmarkRoute);

  // Start server on a random port
  server = app.listen(0);
});

beforeEach(async () => {
  // Clean up test data before each test
  await dbPool.query('DELETE FROM bookmark.bookmarks WHERE user_id = $1', [TEST_USER.id]);
  await dbPool.query('DELETE FROM bookmark.bookmark_sync_logs WHERE user_id = $1', [TEST_USER.id]);
  
  // Verify cleanup
  const remainingBookmarks = await dbPool.query('SELECT COUNT(*) FROM bookmark.bookmarks WHERE user_id = $1', [TEST_USER.id]);
  if (remainingBookmarks[0].count > 0) {
    throw new Error('Cleanup failed - bookmarks still exist');
  }
  
  // Clear all mocks
  jest.clearAllMocks();
});

afterEach(async () => {
  // Clean up test data after each test
  await dbPool.query('DELETE FROM bookmark.bookmarks WHERE user_id = $1', [TEST_USER.id]);
  await dbPool.query('DELETE FROM bookmark.bookmark_sync_logs WHERE user_id = $1', [TEST_USER.id]);
});

afterAll(async () => {
  // Close server
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  
  // Clean up test data one final time
  await dbPool.query('DELETE FROM bookmark.bookmarks WHERE user_id = $1', [TEST_USER.id]);
  await dbPool.query('DELETE FROM bookmark.bookmark_sync_logs WHERE user_id = $1', [TEST_USER.id]);
  
  // Close database connection
  await dbPool.end();
  
  // Clear all timers
  jest.clearAllTimers();
});

/*
 * ────────────────────────────────────────────────────────────────────────────
 * Bookmark Controller Tests
 * ────────────────────────────────────────────────────────────────────────────
 */
describe("Bookmark Controller API", () => {
  describe("GET /api/bookmarks", () => {
    test("✅ Should return empty array when no bookmarks exist", async () => {
      const response = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    test("✅ Should return array of bookmarks when they exist", async () => {
      // First create a bookmark
      const createResponse = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', 'Bearer test-token')
        .send({
          url: 'https://example.com'
        });

      expect(createResponse.status).toBe(201);

      // Then fetch bookmarks
      const response = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('url', 'https://example.com');
    });
  });

  describe("POST /api/bookmarks", () => {
    test("✅ Should create a new bookmark with metadata", async () => {
      const response = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', 'Bearer test-token')
        .send({
          url: 'https://example.com'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('url', 'https://example.com');
      expect(response.body).toHaveProperty('user_id', TEST_USER.id);
      expect(response.body).toHaveProperty('title', 'Test Title');
      expect(response.body).toHaveProperty('description', 'Test Description');
    });

    test("❌ Should reject invalid URLs", async () => {
      const response = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', 'Bearer test-token')
        .send({
          url: 'not-a-url'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid URL format');
    });

    test("❌ Should reject missing URL", async () => {
      const response = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', 'Bearer test-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'URL is required');
    });
  });

  describe("POST /api/bookmarks/batch", () => {
    test("✅ Should create multiple bookmarks", async () => {
      const response = await request(app)
        .post('/api/bookmarks/batch')
        .set('Authorization', 'Bearer test-token')
        .send({
          bookmarks: [
            { url: 'https://example1.com' },
            { url: 'https://example2.com' }
          ]
        });

      expect(response.status).toBe(201);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('url', 'https://example1.com');
      expect(response.body[1]).toHaveProperty('url', 'https://example2.com');
    });

    test("❌ Should reject invalid request format", async () => {
      const response = await request(app)
        .post('/api/bookmarks/batch')
        .set('Authorization', 'Bearer test-token')
        .send({
          bookmarks: 'not-an-array'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Bookmarks must be an array');
    });

    test("❌ Should reject empty bookmark array", async () => {
      const response = await request(app)
        .post('/api/bookmarks/batch')
        .set('Authorization', 'Bearer test-token')
        .send({
          bookmarks: []
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'At least one bookmark is required');
    });
  });
}); 