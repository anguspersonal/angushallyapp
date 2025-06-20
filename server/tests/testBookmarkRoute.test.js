const request = require('supertest');
const express = require('express');
const { authMiddleware } = require('../middleware/auth.js');
const bookmarkRoute = require('../routes/bookmarkRoute.js');

// Mock the auth middleware
jest.mock('../middleware/auth.js', () => ({
  authMiddleware: jest.fn(() => (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  })
}));

// Mock the bookmark service
jest.mock('../bookmark-api/bookmarkService.js', () => ({
  getUserCanonicalBookmarksWithAutoTransfer: jest.fn()
}));

const bookmarkService = require('../bookmark-api/bookmarkService.js');

describe('BookmarkRoute', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/bookmarks', bookmarkRoute);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/bookmarks', () => {
    it('should return user canonical bookmarks successfully', async () => {
      const mockBookmarks = [
        {
          id: 'bookmark-1',
          user_id: 'test-user-id',
          title: 'Test Bookmark 1',
          url: 'https://example.com/1',
          source_type: 'raindrop',
          source_id: '12345',
          created_at: '2025-01-01T00:00:00.000Z'
        },
        {
          id: 'bookmark-2',
          user_id: 'test-user-id',
          title: 'Test Bookmark 2',
          url: 'https://example.com/2',
          source_type: 'manual',
          source_id: 'manual-1',
          created_at: '2025-01-02T00:00:00.000Z'
        }
      ];

      const mockResponse = {
        bookmarks: mockBookmarks,
        _metadata: {
          autoTransfer: false,
          source: 'canonical',
          totalBookmarks: 2
        }
      };

      bookmarkService.getUserCanonicalBookmarksWithAutoTransfer.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/api/bookmarks')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(bookmarkService.getUserCanonicalBookmarksWithAutoTransfer).toHaveBeenCalledWith('test-user-id');
    });

    it('should handle service errors gracefully', async () => {
      const errorMessage = 'Database connection failed';
      bookmarkService.getUserCanonicalBookmarksWithAutoTransfer.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/api/bookmarks')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch bookmarks' });
      expect(bookmarkService.getUserCanonicalBookmarksWithAutoTransfer).toHaveBeenCalledWith('test-user-id');
    });

    it('should return empty array when no bookmarks found', async () => {
      const mockEmptyResponse = {
        bookmarks: [],
        _metadata: {
          autoTransfer: false,
          source: 'none',
          totalBookmarks: 0,
          message: 'No bookmarks found in either canonical or raindrop stores'
        }
      };
      
      bookmarkService.getUserCanonicalBookmarksWithAutoTransfer.mockResolvedValue(mockEmptyResponse);

      const response = await request(app)
        .get('/api/bookmarks')
        .expect(200);

      expect(response.body).toEqual(mockEmptyResponse);
      expect(bookmarkService.getUserCanonicalBookmarksWithAutoTransfer).toHaveBeenCalledWith('test-user-id');
    });

    it('should handle automatic transfer from raindrop when canonical store is empty', async () => {
      const mockTransferredBookmarks = [
        {
          id: 'transferred-1',
          user_id: 'test-user-id',
          title: 'Transferred Bookmark 1',
          url: 'https://example.com/transferred1',
          source_type: 'raindrop',
          source_id: '67890',
          created_at: '2025-01-01T00:00:00.000Z'
        }
      ];

      const mockAutoTransferResponse = {
        bookmarks: mockTransferredBookmarks,
        _metadata: {
          autoTransfer: true,
          source: 'raindrop',
          totalBookmarks: 1,
          transferStats: {
            success: 1,
            failed: 0,
            total: 1,
            enrichmentStats: {
              enriched: 1,
              failed: 0,
              skipped: 0
            }
          },
          message: 'Automatic transfer completed: 1 bookmarks transferred with metadata enrichment'
        }
      };

      bookmarkService.getUserCanonicalBookmarksWithAutoTransfer.mockResolvedValue(mockAutoTransferResponse);

      const response = await request(app)
        .get('/api/bookmarks')
        .expect(200);

      expect(response.body).toEqual(mockAutoTransferResponse);
      expect(bookmarkService.getUserCanonicalBookmarksWithAutoTransfer).toHaveBeenCalledWith('test-user-id');
    });

    // Note: Authentication is handled by the authMiddleware which is mocked to always pass in tests
    // The actual authentication test would need a separate test environment to properly test auth rejection
  });
}); 