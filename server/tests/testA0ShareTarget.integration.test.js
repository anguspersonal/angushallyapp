/**
 * Integration Tests for A0 - Native Share Target Implementation
 * 
 * Tests the full flow including database operations and OpenGraph fetching
 */

const request = require('supertest');
const express = require('express');
const crypto = require('crypto');

// Load environment
require('../../config/env');

// Mock authentication for integration tests
jest.mock('../middleware/auth', () => ({
  authMiddleware: () => (req, res, next) => {
    req.user = { id: 'integration-test-user-id' };
    next();
  }
}));

// Mock OpenGraph to avoid external HTTP calls
jest.mock('../bookmark-api/openGraph', () => ({
  isValidUrl: jest.fn((url) => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }),
  fetchMetadata: jest.fn()
}));

// Import after mocking
const bookmarkRoute = require('../routes/bookmarkRoute');
const openGraph = require('../bookmark-api/openGraph');
const db = require('../db');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/bookmarks', bookmarkRoute);

describe('A0 Share Target Integration Tests', () => {
  const testUserId = 'integration-test-user-id';
  let createdBookmarkIds = [];

  beforeEach(() => {
    jest.clearAllMocks();
    // Default successful OpenGraph response
    openGraph.fetchMetadata.mockResolvedValue({
      title: 'Integration Test Article',
      description: 'Test description from OpenGraph',
      image: 'https://example.com/test-image.jpg',
      site_name: 'Test Site',
      resolved_url: 'https://example.com/resolved'
    });
  });

  afterEach(async () => {
    // Clean up created bookmarks
    if (createdBookmarkIds.length > 0) {
      await db.query(
        'DELETE FROM bookmarks.bookmarks WHERE id = ANY($1)',
        [createdBookmarkIds]
      );
      createdBookmarkIds = [];
    }
  });

  describe('Database Integration', () => {
    test('should save bookmark to database with enriched metadata', async () => {
      const testUrl = 'https://integration-test.com/article';
      
      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: testUrl,
          title: 'Integration Test Title',
          text: 'Integration test shared content'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.bookmark.enriched).toBe(true);

      // Track for cleanup
      createdBookmarkIds.push(response.body.bookmark.id);

      // Verify bookmark exists in database
      const dbBookmarks = await db.query(
        'SELECT * FROM bookmarks.bookmarks WHERE id = $1',
        [response.body.bookmark.id]
      );

      expect(dbBookmarks.length).toBe(1);
      const bookmark = dbBookmarks[0];

      expect(bookmark.user_id).toBe(testUserId);
      expect(bookmark.title).toBe('Integration Test Title');
      expect(bookmark.url).toBe(testUrl);
      expect(bookmark.source_type).toBe('share');
      expect(bookmark.source_metadata.share_source).toBe('native_share_target');
      expect(bookmark.source_metadata.metadata_enriched).toBe(true);
      expect(bookmark.description).toBe('Test description from OpenGraph');
      expect(bookmark.image_url).toBe('https://example.com/test-image.jpg');
    });

    test('should handle duplicate URLs correctly', async () => {
      const testUrl = 'https://duplicate-test.com/article';
      
      // Create first bookmark
      const response1 = await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: testUrl,
          title: 'First Bookmark'
        });

      expect(response1.status).toBe(201);
      createdBookmarkIds.push(response1.body.bookmark.id);

      // Try to create duplicate
      const response2 = await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: testUrl,
          title: 'Duplicate Bookmark'
        });

      expect(response2.status).toBe(200);
      expect(response2.body.duplicate).toBe(true);
      expect(response2.body.bookmark.id).toBe(response1.body.bookmark.id);

      // Verify only one bookmark exists in database
      const urlHash = crypto.createHash('md5').update(testUrl).digest('hex');
      const dbBookmarks = await db.query(
        'SELECT * FROM bookmarks.bookmarks WHERE source_type = $1 AND source_id = $2',
        ['share', urlHash]
      );

      expect(dbBookmarks.length).toBe(1);
    });

    test('should save bookmark without enrichment when OpenGraph fails', async () => {
      const testUrl = 'https://no-metadata.com/article';
      
      // Mock OpenGraph failure
      openGraph.fetchMetadata.mockRejectedValue(new Error('No metadata available'));

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: testUrl,
          title: 'No Metadata Test'
        });

      expect(response.status).toBe(201);
      expect(response.body.bookmark.enriched).toBe(false);

      createdBookmarkIds.push(response.body.bookmark.id);

      // Verify bookmark saved without enrichment
      const dbBookmarks = await db.query(
        'SELECT * FROM bookmarks.bookmarks WHERE id = $1',
        [response.body.bookmark.id]
      );

      const bookmark = dbBookmarks[0];
      expect(bookmark.title).toBe('No Metadata Test');
      expect(bookmark.description).toBeNull();
      expect(bookmark.image_url).toBeNull();
      expect(bookmark.source_metadata.metadata_enriched).toBe(false);
    });
  });

  describe('URL Hash Generation', () => {
    test('should generate consistent hash for same URL', async () => {
      const testUrl = 'https://hash-test.com/article';
      const expectedHash = crypto.createHash('md5').update(testUrl).digest('hex');

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: testUrl,
          title: 'Hash Test'
        });

      expect(response.status).toBe(201);
      createdBookmarkIds.push(response.body.bookmark.id);

      // Verify hash in database
      const dbBookmarks = await db.query(
        'SELECT * FROM bookmarks.bookmarks WHERE source_id = $1',
        [expectedHash]
      );

      expect(dbBookmarks.length).toBe(1);
      expect(dbBookmarks[0].source_id).toBe(expectedHash);
    });
  });

  describe('Source Metadata Storage', () => {
    test('should store comprehensive source metadata', async () => {
      const testUrl = 'https://metadata-test.com/article';
      const testTime = new Date().toISOString();

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: testUrl,
          title: 'Metadata Test',
          text: 'Shared text content'
        });

      expect(response.status).toBe(201);
      createdBookmarkIds.push(response.body.bookmark.id);

      // Verify metadata structure
      const dbBookmarks = await db.query(
        'SELECT source_metadata FROM bookmarks.bookmarks WHERE id = $1',
        [response.body.bookmark.id]
      );

      const metadata = dbBookmarks[0].source_metadata;
      expect(metadata.share_source).toBe('native_share_target');
      expect(metadata.original_text).toBe('Shared text content');
      expect(metadata.original_title).toBe('Metadata Test');
      expect(metadata.metadata_enriched).toBe(true);
      expect(metadata.metadata_source).toBe('opengraph');
      expect(metadata.shared_at).toBeDefined();
      expect(new Date(metadata.shared_at)).toBeInstanceOf(Date);
    });
  });

  describe('Error Scenarios', () => {
    test('should handle database constraint violations gracefully', async () => {
      // Create a bookmark with invalid user_id to test constraint handling
      const testUrl = 'https://constraint-test.com/article';

      // Mock auth to return invalid user ID
      const originalAuth = require('../middleware/auth');
      jest.doMock('../middleware/auth', () => ({
        authMiddleware: () => (req, res, next) => {
          req.user = { id: 'non-existent-user-id' };
          next();
        }
      }));

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: testUrl,
          title: 'Constraint Test'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to save bookmark');
    });
  });

  describe('OpenGraph Integration', () => {
    test('should handle various OpenGraph response formats', async () => {
      const testUrl = 'https://og-formats.com/article';

      // Test minimal OpenGraph response
      openGraph.fetchMetadata.mockResolvedValue({
        title: 'Minimal OG Response'
      });

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({ url: testUrl });

      expect(response.status).toBe(201);
      createdBookmarkIds.push(response.body.bookmark.id);

      const dbBookmarks = await db.query(
        'SELECT * FROM bookmarks.bookmarks WHERE id = $1',
        [response.body.bookmark.id]
      );

      const bookmark = dbBookmarks[0];
      expect(bookmark.title).toBe('Minimal OG Response');
      expect(bookmark.description).toBeNull();
      expect(bookmark.image_url).toBeNull();
      expect(bookmark.resolved_url).toBe(testUrl); // Falls back to original URL
    });

    test('should handle OpenGraph error responses', async () => {
      const testUrl = 'https://og-error.com/article';

      // Mock OpenGraph error response
      openGraph.fetchMetadata.mockResolvedValue({
        error: { message: 'HTTP 404 Not Found' }
      });

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: testUrl,
          title: 'Error Test'
        });

      expect(response.status).toBe(201);
      createdBookmarkIds.push(response.body.bookmark.id);

      const dbBookmarks = await db.query(
        'SELECT * FROM bookmarks.bookmarks WHERE id = $1',
        [response.body.bookmark.id]
      );

      const bookmark = dbBookmarks[0];
      expect(bookmark.source_metadata.metadata_enriched).toBe(false);
      expect(bookmark.source_metadata.metadata_error).toEqual({ message: 'HTTP 404 Not Found' });
    });
  });
}); 