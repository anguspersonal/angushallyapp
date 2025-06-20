const request = require('supertest');
const express = require('express');
const { authMiddleware } = require('../middleware/auth.js');
const bookmarkRoute = require('../routes/bookmarkRoute.js');

// Mock the auth middleware
jest.mock('../middleware/auth.js', () => ({
  authMiddleware: () => (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

// Mock the bookmark service
jest.mock('../bookmark-api/bookmarkService.js', () => ({
  getUserCanonicalBookmarks: jest.fn()
}));

const bookmarkService = require('../bookmark-api/bookmarkService.js');

describe('BookmarkRoute', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock auth middleware to pass through
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { id: 'test-user-id' };
      next();
    });
    
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
          created_at: new Date('2025-01-01T00:00:00Z')
        },
        {
          id: 'bookmark-2',
          user_id: 'test-user-id',
          title: 'Test Bookmark 2',
          url: 'https://example.com/2',
          source_type: 'manual',
          source_id: 'manual-1',
          created_at: new Date('2025-01-02T00:00:00Z')
        }
      ];

      bookmarkService.getUserCanonicalBookmarks.mockResolvedValue(mockBookmarks);

      const response = await request(app)
        .get('/api/bookmarks')
        .expect(200);

      expect(response.body).toEqual({ bookmarks: mockBookmarks });
      expect(bookmarkService.getUserCanonicalBookmarks).toHaveBeenCalledWith('test-user-id');
    });

    it('should handle service errors gracefully', async () => {
      const errorMessage = 'Database connection failed';
      bookmarkService.getUserCanonicalBookmarks.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/api/bookmarks')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch bookmarks' });
      expect(bookmarkService.getUserCanonicalBookmarks).toHaveBeenCalledWith('test-user-id');
    });

    it('should return empty array when no bookmarks found', async () => {
      bookmarkService.getUserCanonicalBookmarks.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/bookmarks')
        .expect(200);

      expect(response.body).toEqual({ bookmarks: [] });
      expect(bookmarkService.getUserCanonicalBookmarks).toHaveBeenCalledWith('test-user-id');
    });

    it('should require authentication', async () => {
      // Mock auth middleware to reject
      authMiddleware.mockImplementation((req, res, next) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/api/bookmarks')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(bookmarkService.getUserCanonicalBookmarks).not.toHaveBeenCalled();
    });
  });
}); 