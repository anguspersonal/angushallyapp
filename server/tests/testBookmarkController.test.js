// Mock the database before any imports
jest.mock('../db', () => ({
    query: jest.fn(),
    end: jest.fn(),
    pool: {
        connect: jest.fn()
    }
}));

// Mock the bookmark service
jest.mock('../bookmark-api/bookmarkService', () => ({
    addBookmark: jest.fn(),
    upsertBookmarks: jest.fn(),
    getBookmarks: jest.fn(),
    logSync: jest.fn()
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

const config = require('../../config/env');
const path = require('path');
const request = require('supertest');
const db = require("../db");
const bookmarkService = require('../bookmark-api/bookmarkService');
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

beforeAll(async () => {
  // Setup Express app for testing
  app = express();
  app.use(express.json());
  
  // Mock auth middleware - inject user into request
  app.use((req, res, next) => {
    req.user = TEST_USER;
    next();
  });
  
  app.use('/api/bookmarks', bookmarkRoute);
});

beforeEach(async () => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Set default successful mock behavior
  bookmarkService.getBookmarks.mockResolvedValue([]);
  bookmarkService.addBookmark.mockResolvedValue({});
  bookmarkService.upsertBookmarks.mockResolvedValue([]);
  bookmarkService.logSync.mockResolvedValue();
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
 * Bookmark Controller Tests
 * ────────────────────────────────────────────────────────────────────────────
 */
describe("Bookmark Controller API", () => {
  describe("GET /api/bookmarks", () => {
    test("✅ Should return empty array when no bookmarks exist", async () => {
      // Mock empty result
      bookmarkService.getBookmarks.mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
      expect(bookmarkService.getBookmarks).toHaveBeenCalledWith(TEST_USER.id);
    });

    test("✅ Should return array of bookmarks when they exist", async () => {
      const mockBookmarks = [
        {
          id: 1,
          url: 'https://example.com',
          title: 'Test Title',
          description: 'Test Description',
          user_id: TEST_USER.id,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      // Mock existing bookmarks
      bookmarkService.getBookmarks.mockResolvedValueOnce(mockBookmarks);

      const response = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('url', 'https://example.com');
      expect(bookmarkService.getBookmarks).toHaveBeenCalledWith(TEST_USER.id);
    });
  });

  describe("POST /api/bookmarks", () => {
    test("✅ Should create a new bookmark with metadata", async () => {
      const mockBookmark = {
        id: 1,
        url: 'https://example.com',
        title: 'Test Title',
        description: 'Test Description',
        user_id: TEST_USER.id,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock bookmark service response
      bookmarkService.addBookmark.mockResolvedValueOnce(mockBookmark);

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
      expect(bookmarkService.addBookmark).toHaveBeenCalledWith(
        TEST_USER.id,
        expect.objectContaining({
          url: 'https://example.com',
          title: 'Test Title',
          description: 'Test Description'
        })
      );
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
      // Should not call service for invalid URLs
      expect(bookmarkService.addBookmark).not.toHaveBeenCalled();
    });

    test("❌ Should reject missing URL", async () => {
      const response = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', 'Bearer test-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'URL is required');
      // Should not call service for missing URL
      expect(bookmarkService.addBookmark).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/bookmarks/batch", () => {
    test("✅ Should create multiple bookmarks", async () => {
      const mockBookmarks = [
        {
          id: 1,
          url: 'https://example1.com',
          title: 'Test Title',
          user_id: TEST_USER.id,
          created_at: new Date()
        },
        {
          id: 2,
          url: 'https://example2.com',
          title: 'Test Title',
          user_id: TEST_USER.id,
          created_at: new Date()
        }
      ];

      // Mock batch upsert response
      bookmarkService.upsertBookmarks.mockResolvedValueOnce(mockBookmarks);

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
      expect(bookmarkService.upsertBookmarks).toHaveBeenCalledWith(
        TEST_USER.id,
        expect.arrayContaining([
          expect.objectContaining({ 
            url: 'https://example1.com',
            title: 'Test Title',
            description: 'Test Description'
          }),
          expect.objectContaining({ 
            url: 'https://example2.com',
            title: 'Test Title',
            description: 'Test Description'
          })
        ])
      );
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
      // Should not call service for invalid format
      expect(bookmarkService.upsertBookmarks).not.toHaveBeenCalled();
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
      // Should not call service for empty array
      expect(bookmarkService.upsertBookmarks).not.toHaveBeenCalled();
    });
  });
}); 