const request = require('supertest');
const express = require('express');
const bookmarkService = require('../bookmark-api/bookmarkService');

// Mock the bookmark service
jest.mock('../bookmark-api/bookmarkService');

// Mock the auth middleware
jest.mock('../middleware/auth', () => ({
  authMiddleware: () => (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

// Mock the raindrop route
const raindropRoute = require('../routes/raindropRoute');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/raindrop', raindropRoute);

describe('Raindrop Transfer Route Tests', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to prevent error logs in test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('POST /api/raindrop/transfer', () => {
    it('should transfer unorganized bookmarks successfully', async () => {
      const mockTransferResult = {
        success: 2,
        failed: 0,
        total: 2,
        errors: [],
        transferredBookmarks: [
          {
            stagingId: 1,
            canonicalId: 'canonical-uuid-1',
            title: 'Test Bookmark 1'
          },
          {
            stagingId: 2,
            canonicalId: 'canonical-uuid-2',
            title: 'Test Bookmark 2'
          }
        ]
      };

      bookmarkService.transferUnorganizedRaindropBookmarks.mockResolvedValue(mockTransferResult);

      const response = await request(app)
        .post('/api/raindrop/transfer')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(bookmarkService.transferUnorganizedRaindropBookmarks).toHaveBeenCalledWith('test-user-id');
      expect(response.body).toEqual({
        message: 'Transfer completed',
        ...mockTransferResult
      });
    });

    it('should handle empty transfer results', async () => {
      const mockTransferResult = {
        success: 0,
        failed: 0,
        total: 0,
        errors: [],
        message: 'No unorganized bookmarks found'
      };

      bookmarkService.transferUnorganizedRaindropBookmarks.mockResolvedValue(mockTransferResult);

      const response = await request(app)
        .post('/api/raindrop/transfer')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Transfer completed',
        ...mockTransferResult
      });
    });

    it('should handle partial failures', async () => {
      const mockTransferResult = {
        success: 1,
        failed: 1,
        total: 2,
        errors: [
          {
            bookmarkId: 2,
            title: 'Failed Bookmark',
            error: 'Database error'
          }
        ],
        transferredBookmarks: [
          {
            stagingId: 1,
            canonicalId: 'canonical-uuid-1',
            title: 'Successful Bookmark'
          }
        ]
      };

      bookmarkService.transferUnorganizedRaindropBookmarks.mockResolvedValue(mockTransferResult);

      const response = await request(app)
        .post('/api/raindrop/transfer')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Transfer completed',
        ...mockTransferResult
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      bookmarkService.transferUnorganizedRaindropBookmarks.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/raindrop/transfer')
        .set('Authorization', 'Bearer test-token')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to transfer bookmarks',
        details: 'Database connection failed'
      });
    });

    it('should call the service with correct user ID', async () => {
      const mockTransferResult = {
        success: 0,
        failed: 0,
        total: 0,
        errors: [],
        message: 'No unorganized bookmarks found'
      };

      bookmarkService.transferUnorganizedRaindropBookmarks.mockResolvedValue(mockTransferResult);

      await request(app)
        .post('/api/raindrop/transfer')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(bookmarkService.transferUnorganizedRaindropBookmarks).toHaveBeenCalledWith('test-user-id');
    });
  });
}); 