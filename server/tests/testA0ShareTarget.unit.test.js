/**
 * Unit Tests for A0 - Native Share Target Implementation
 * 
 * Tests the POST /api/bookmarks/share endpoint that handles
 * PWA/Android/iOS shared content processing.
 */

const request = require('supertest');
const express = require('express');
const crypto = require('crypto');

// Mock dependencies
jest.mock('../middleware/auth', () => ({
  authMiddleware: () => (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

jest.mock('../bookmark-api/bookmarkService', () => ({
  createCanonicalBookmark: jest.fn(),
  validateBookmarkData: jest.fn(),
  checkCanonicalBookmarkExists: jest.fn()
}));

jest.mock('../bookmark-api/openGraph', () => ({
  isValidUrl: jest.fn(),
  fetchMetadata: jest.fn()
}));

// Import after mocking
const bookmarkRoute = require('../routes/bookmarkRoute');
const { createCanonicalBookmark, validateBookmarkData, checkCanonicalBookmarkExists } = require('../bookmark-api/bookmarkService');
const openGraph = require('../bookmark-api/openGraph');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/bookmarks', bookmarkRoute);

describe('A0 Share Target - POST /api/bookmarks/share', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    test('should return 400 when URL is missing', async () => {
      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({
          text: 'Some text',
          title: 'Some title'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('URL is required');
      expect(response.body.details).toBe('Please provide a url parameter with the content to bookmark');
    });

    test('should return 400 when URL format is invalid', async () => {
      openGraph.isValidUrl.mockReturnValue(false);

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: 'invalid-url',
          text: 'Some text'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid URL format');
      expect(response.body.details).toBe('Please provide a valid HTTP or HTTPS URL');
      expect(openGraph.isValidUrl).toHaveBeenCalledWith('invalid-url');
    });
  });

  describe('Duplicate Detection', () => {
    test('should return existing bookmark when duplicate found', async () => {
      const testUrl = 'https://example.com/test';
      const urlHash = crypto.createHash('md5').update(testUrl).digest('hex');
      const existingBookmark = {
        id: 'existing-bookmark-id',
        title: 'Existing Bookmark',
        url: testUrl
      };

      openGraph.isValidUrl.mockReturnValue(true);
      checkCanonicalBookmarkExists.mockResolvedValue(existingBookmark);

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: testUrl,
          text: 'Some text'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Bookmark already exists');
      expect(response.body.bookmark).toEqual(existingBookmark);
      expect(response.body.duplicate).toBe(true);
      expect(checkCanonicalBookmarkExists).toHaveBeenCalledWith('test-user-id', 'share', urlHash);
    });
  });

  describe('Successful Bookmark Creation', () => {
    test('should create bookmark with OpenGraph enrichment', async () => {
      const testUrl = 'https://example.com/article';
      const urlHash = crypto.createHash('md5').update(testUrl).digest('hex');
      const mockMetadata = {
        title: 'OpenGraph Title',
        description: 'OpenGraph Description',
        image: 'https://example.com/image.jpg',
        site_name: 'Example Site',
        resolved_url: 'https://example.com/article'
      };
      const createdBookmark = {
        id: 'new-bookmark-id',
        title: 'OpenGraph Title',
        url: testUrl,
        description: 'OpenGraph Description'
      };

      openGraph.isValidUrl.mockReturnValue(true);
      checkCanonicalBookmarkExists.mockResolvedValue(null);
      openGraph.fetchMetadata.mockResolvedValue(mockMetadata);
      validateBookmarkData.mockReturnValue({ isValid: true, errors: [] });
      createCanonicalBookmark.mockResolvedValue(createdBookmark);

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: testUrl,
          text: 'Shared text',
          title: 'Shared title'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Bookmark saved successfully');
      expect(response.body.bookmark).toEqual({
        id: 'new-bookmark-id',
        title: 'OpenGraph Title',
        url: testUrl,
        enriched: true
      });

      // Verify bookmark data structure
      expect(createCanonicalBookmark).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user-id',
          title: 'Shared title', // User-provided title takes priority
          url: testUrl,
          resolved_url: 'https://example.com/article',
          description: 'OpenGraph Description',
          image_url: 'https://example.com/image.jpg',
          site_name: 'Example Site',
          source_type: 'share',
          source_id: urlHash,
          source_metadata: expect.objectContaining({
            share_source: 'native_share_target',
            original_text: 'Shared text',
            original_title: 'Shared title',
            metadata_enriched: true,
            metadata_source: 'opengraph'
          })
        })
      );
    });

    test('should create bookmark without enrichment when OpenGraph fails', async () => {
      const testUrl = 'https://example.com/no-og';
      const urlHash = crypto.createHash('md5').update(testUrl).digest('hex');
      const createdBookmark = {
        id: 'new-bookmark-id',
        title: 'Fallback Title',
        url: testUrl
      };

      openGraph.isValidUrl.mockReturnValue(true);
      checkCanonicalBookmarkExists.mockResolvedValue(null);
      openGraph.fetchMetadata.mockRejectedValue(new Error('Metadata fetch failed'));
      validateBookmarkData.mockReturnValue({ isValid: true, errors: [] });
      createCanonicalBookmark.mockResolvedValue(createdBookmark);

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: testUrl,
          title: 'Fallback Title'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.bookmark.enriched).toBe(false);

      // Verify bookmark created with fallback data
      expect(createCanonicalBookmark).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Fallback Title',
          url: testUrl,
          resolved_url: testUrl, // Falls back to original URL
          source_metadata: expect.objectContaining({
            metadata_enriched: false,
            metadata_source: null
          })
        })
      );
    });

    test('should use URL as title when no title provided', async () => {
      const testUrl = 'https://example.com/no-title';
      
      openGraph.isValidUrl.mockReturnValue(true);
      checkCanonicalBookmarkExists.mockResolvedValue(null);
      openGraph.fetchMetadata.mockResolvedValue({ error: 'No metadata' });
      validateBookmarkData.mockReturnValue({ isValid: true, errors: [] });
      createCanonicalBookmark.mockResolvedValue({
        id: 'new-bookmark-id',
        title: testUrl,
        url: testUrl
      });

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({ url: testUrl });

      expect(response.status).toBe(201);
      expect(createCanonicalBookmark).toHaveBeenCalledWith(
        expect.objectContaining({
          title: testUrl // URL used as fallback title
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('should return 400 when bookmark validation fails', async () => {
      const testUrl = 'https://example.com/invalid';

      openGraph.isValidUrl.mockReturnValue(true);
      checkCanonicalBookmarkExists.mockResolvedValue(null);
      openGraph.fetchMetadata.mockResolvedValue({});
      validateBookmarkData.mockReturnValue({ 
        isValid: false, 
        errors: ['title is required', 'url is required'] 
      });

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({ url: testUrl });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid bookmark data');
      expect(response.body.details).toEqual(['title is required', 'url is required']);
    });

    test('should return 500 when bookmark creation fails', async () => {
      const testUrl = 'https://example.com/error';

      openGraph.isValidUrl.mockReturnValue(true);
      checkCanonicalBookmarkExists.mockResolvedValue(null);
      openGraph.fetchMetadata.mockResolvedValue({});
      validateBookmarkData.mockReturnValue({ isValid: true, errors: [] });
      createCanonicalBookmark.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/bookmarks/share')
        .send({ url: testUrl, title: 'Test Title' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to save bookmark');
      expect(response.body.details).toBe('An error occurred while processing the shared content');
    });
  });

  describe('Authentication', () => {
    test('should include user ID in bookmark data', async () => {
      const testUrl = 'https://example.com/auth-test';

      openGraph.isValidUrl.mockReturnValue(true);
      checkCanonicalBookmarkExists.mockResolvedValue(null);
      openGraph.fetchMetadata.mockResolvedValue({});
      validateBookmarkData.mockReturnValue({ isValid: true, errors: [] });
      createCanonicalBookmark.mockResolvedValue({
        id: 'new-bookmark-id',
        title: 'Auth Test',
        url: testUrl
      });

      await request(app)
        .post('/api/bookmarks/share')
        .send({ url: testUrl, title: 'Auth Test' });

      expect(createCanonicalBookmark).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user-id'
        })
      );
    });
  });

  describe('Title Priority Logic', () => {
    test('should prioritize user title > text > OpenGraph title > URL', async () => {
      const testUrl = 'https://example.com/priority-test';
      const mockMetadata = {
        title: 'OpenGraph Title'
      };

      openGraph.isValidUrl.mockReturnValue(true);
      checkCanonicalBookmarkExists.mockResolvedValue(null);
      openGraph.fetchMetadata.mockResolvedValue(mockMetadata);
      validateBookmarkData.mockReturnValue({ isValid: true, errors: [] });
      createCanonicalBookmark.mockResolvedValue({
        id: 'new-bookmark-id',
        title: 'User Title',
        url: testUrl
      });

      await request(app)
        .post('/api/bookmarks/share')
        .send({
          url: testUrl,
          title: 'User Title',
          text: 'Shared Text'
        });

      expect(createCanonicalBookmark).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'User Title' // User title wins over text and OpenGraph
        })
      );
    });
  });
}); 