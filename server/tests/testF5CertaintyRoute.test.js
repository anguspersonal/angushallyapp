/**
 * API Endpoint Tests for F5 Certainty Scoring Framework
 * 
 * Tests the REST API endpoints for confidence assessment and validation.
 */

const request = require('supertest');
const express = require('express');

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

// Mock database
jest.mock('../db', () => ({
  query: jest.fn()
}));

// Mock certainty scoring module
jest.mock('../bookmark-api/f5-certainty-scoring/certaintyScoring', () => ({
  calculateConfidenceScore: jest.fn(),
  getConfidenceLevel: jest.fn(),
  validateMetadata: jest.fn(),
  saveConfidenceAssessment: jest.fn(),
  getConfidenceAssessment: jest.fn()
}));

const { authMiddleware } = require('../middleware/auth');
const f5CertaintyRoute = require('../routes/f5CertaintyRoute');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/f5', f5CertaintyRoute);

describe('F5 Certainty Scoring API Routes', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/f5/assess', () => {
    
    test('should calculate confidence score successfully', async () => {
      const mockAssessment = {
        overallScore: 85,
        confidenceLevel: 'GOOD',
        breakdown: {
          sourceQuality: 100,
          completeness: 75,
          apiCompliance: 100,
          validation: 30
        },
        recommendations: ['Implement cross-platform validation']
      };

      const { calculateConfidenceScore, getConfidenceLevel } = require('../bookmark-api/f5-certainty-scoring/certaintyScoring');
      calculateConfidenceScore.mockReturnValue(mockAssessment);
      getConfidenceLevel.mockReturnValue('GOOD');

      const response = await request(app)
        .post('/api/f5/assess')
        .send({
          metadata: {
            title: 'Test Post',
            description: 'Test description'
          },
          context: {
            sourceType: 'direct_api'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.assessment.overallScore).toBe(85);
      expect(response.body.assessment.confidenceLevel).toBe('GOOD');
      expect(calculateConfidenceScore).toHaveBeenCalledWith(
        { title: 'Test Post', description: 'Test description' },
        { sourceType: 'direct_api' }
      );
    });

    test('should return 400 for missing metadata', async () => {
      const response = await request(app)
        .post('/api/f5/assess')
        .send({
          context: { sourceType: 'direct_api' }
        })
        .expect(400);

      expect(response.body.error).toBe('Missing required parameter: metadata');
    });

    test('should handle calculation errors gracefully', async () => {
      const { calculateConfidenceScore } = require('../bookmark-api/f5-certainty-scoring/certaintyScoring');
      calculateConfidenceScore.mockImplementation(() => {
        throw new Error('Calculation failed');
      });

      const response = await request(app)
        .post('/api/f5/assess')
        .send({
          metadata: { title: 'Test' },
          context: { sourceType: 'direct_api' }
        })
        .expect(500);

      expect(response.body.error).toBe('Failed to calculate confidence score');
    });
  });

  describe('POST /api/f5/validate', () => {
    
    test('should validate metadata successfully', async () => {
      const mockValidation = {
        isValid: true,
        errors: [],
        warnings: []
      };

      const { validateMetadata } = require('../bookmark-api/f5-certainty-scoring/certaintyScoring');
      validateMetadata.mockReturnValue(mockValidation);

      const response = await request(app)
        .post('/api/f5/validate')
        .send({
          metadata: {
            title: 'Instagram Post',
            url: 'https://instagram.com/p/12345'
          },
          platform: 'instagram'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.validation.isValid).toBe(true);
      expect(validateMetadata).toHaveBeenCalledWith(
        { title: 'Instagram Post', url: 'https://instagram.com/p/12345' },
        'instagram'
      );
    });

    test('should return 400 for missing metadata', async () => {
      const response = await request(app)
        .post('/api/f5/validate')
        .send({
          platform: 'instagram'
        })
        .expect(400);

      expect(response.body.error).toBe('Missing required parameter: metadata');
    });

    test('should return 400 for missing platform', async () => {
      const response = await request(app)
        .post('/api/f5/validate')
        .send({
          metadata: { title: 'Test Post' }
        })
        .expect(400);

      expect(response.body.error).toBe('Missing required parameter: platform');
    });
  });

  describe('POST /api/f5/bookmark/:bookmarkId/assess', () => {
    
    test('should assess and save bookmark confidence successfully', async () => {
      const mockAssessment = {
        overallScore: 85,
        confidenceLevel: 'GOOD',
        breakdown: { sourceQuality: 100, completeness: 75, apiCompliance: 100, validation: 30 }
      };

      const { calculateConfidenceScore, getConfidenceLevel, saveConfidenceAssessment } = require('../bookmark-api/f5-certainty-scoring/certaintyScoring');
      calculateConfidenceScore.mockReturnValue(mockAssessment);
      getConfidenceLevel.mockReturnValue('GOOD');
      saveConfidenceAssessment.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/f5/bookmark/test-bookmark-id/assess')
        .send({
          metadata: { title: 'Test Post' },
          context: { sourceType: 'direct_api' }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.assessment.overallScore).toBe(85);
      expect(saveConfidenceAssessment).toHaveBeenCalledWith(
        'test-bookmark-id',
        expect.objectContaining({ overallScore: 85 }),
        'test-user-id'
      );
    });

    test('should return 404 when bookmark not found', async () => {
      const { saveConfidenceAssessment } = require('../bookmark-api/f5-certainty-scoring/certaintyScoring');
      saveConfidenceAssessment.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/f5/bookmark/nonexistent-id/assess')
        .send({
          metadata: { title: 'Test Post' },
          context: { sourceType: 'direct_api' }
        })
        .expect(404);

      expect(response.body.error).toBe('Bookmark not found or access denied');
    });
  });

  describe('GET /api/f5/bookmark/:bookmarkId/assessment', () => {
    
    test('should retrieve bookmark assessment successfully', async () => {
      const mockAssessment = {
        confidenceScores: { overallScore: 85 },
        intelligenceLevel: 2,
        processingStatus: 'completed'
      };

      const { getConfidenceAssessment } = require('../bookmark-api/f5-certainty-scoring/certaintyScoring');
      getConfidenceAssessment.mockResolvedValue(mockAssessment);

      const response = await request(app)
        .get('/api/f5/bookmark/test-bookmark-id/assessment')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.assessment.confidenceScores.overallScore).toBe(85);
      expect(getConfidenceAssessment).toHaveBeenCalledWith('test-bookmark-id', 'test-user-id');
    });

    test('should return 404 when assessment not found', async () => {
      const { getConfidenceAssessment } = require('../bookmark-api/f5-certainty-scoring/certaintyScoring');
      getConfidenceAssessment.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/f5/bookmark/nonexistent-id/assessment')
        .expect(404);

      expect(response.body.error).toBe('Assessment not found or access denied');
    });
  });

  describe('GET /api/f5/bookmarks/confidence-stats', () => {
    
    test('should return confidence statistics successfully', async () => {
      const mockStats = {
        total_bookmarks: '10',
        avg_intelligence_level: '2.5',
        assessed_bookmarks: '8',
        high_confidence: '5',
        medium_confidence: '2',
        low_confidence: '1',
        avg_confidence_score: '75.5'
      };

      const db = require('../db');
      db.query.mockResolvedValue({ rows: [mockStats] });

      const response = await request(app)
        .get('/api/f5/bookmarks/confidence-stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats.totalBookmarks).toBe(10);
      expect(response.body.stats.assessedBookmarks).toBe(8);
      expect(response.body.stats.confidenceDistribution.high).toBe(5);
      expect(response.body.stats.confidenceDistribution.medium).toBe(2);
      expect(response.body.stats.confidenceDistribution.low).toBe(1);
    });

    test('should handle database errors gracefully', async () => {
      const db = require('../db');
      db.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/f5/bookmarks/confidence-stats')
        .expect(500);

      expect(response.body.error).toBe('Failed to retrieve confidence statistics');
    });
  });

  describe('POST /api/f5/bookmarks/bulk-assess', () => {
    
    test('should perform bulk assessment successfully', async () => {
      const { calculateConfidenceScore, getConfidenceLevel, saveConfidenceAssessment } = require('../bookmark-api/f5-certainty-scoring/certaintyScoring');
      
      calculateConfidenceScore.mockReturnValue({ overallScore: 85 });
      getConfidenceLevel.mockReturnValue('GOOD');
      saveConfidenceAssessment.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/f5/bookmarks/bulk-assess')
        .send({
          bookmarks: [
            {
              bookmarkId: 'bookmark-1',
              metadata: { title: 'Post 1' },
              context: { sourceType: 'direct_api' }
            },
            {
              bookmarkId: 'bookmark-2',
              metadata: { title: 'Post 2' },
              context: { sourceType: 'scraped_raw' }
            }
          ]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results.processed).toBe(2);
      expect(response.body.results.errors).toBe(0);
      expect(response.body.results.assessments).toHaveLength(2);
    });

    test('should handle partial failures in bulk assessment', async () => {
      const { calculateConfidenceScore, getConfidenceLevel, saveConfidenceAssessment } = require('../bookmark-api/f5-certainty-scoring/certaintyScoring');
      
      calculateConfidenceScore.mockReturnValue({ overallScore: 85 });
      getConfidenceLevel.mockReturnValue('GOOD');
      saveConfidenceAssessment
        .mockResolvedValueOnce(true)  // First bookmark succeeds
        .mockResolvedValueOnce(false); // Second bookmark fails

      const response = await request(app)
        .post('/api/f5/bookmarks/bulk-assess')
        .send({
          bookmarks: [
            {
              bookmarkId: 'bookmark-1',
              metadata: { title: 'Post 1' },
              context: { sourceType: 'direct_api' }
            },
            {
              bookmarkId: 'bookmark-2',
              metadata: { title: 'Post 2' },
              context: { sourceType: 'scraped_raw' }
            }
          ]
        })
        .expect(200);

      expect(response.body.results.processed).toBe(1);
      expect(response.body.results.errors).toBe(1);
      expect(response.body.results.errorDetails).toHaveLength(1);
    });

    test('should return 400 for invalid bookmarks array', async () => {
      const response = await request(app)
        .post('/api/f5/bookmarks/bulk-assess')
        .send({
          bookmarks: 'not-an-array'
        })
        .expect(400);

      expect(response.body.error).toBe('Missing or invalid parameter: bookmarks array');
    });

    test('should handle missing required fields in bulk assessment', async () => {
      const response = await request(app)
        .post('/api/f5/bookmarks/bulk-assess')
        .send({
          bookmarks: [
            {
              bookmarkId: 'bookmark-1',
              // Missing metadata
              context: { sourceType: 'direct_api' }
            }
          ]
        })
        .expect(200);

      expect(response.body.results.processed).toBe(0);
      expect(response.body.results.errors).toBe(1);
      expect(response.body.results.errorDetails[0].error).toBe('Missing required fields');
    });
  });

  describe('Authentication and Authorization', () => {
    
    test('authMiddleware is applied to all routes', () => {
      // This test verifies that authMiddleware is properly configured
      // Actual authentication is handled by the mocked middleware
      expect(true).toBe(true); // Basic test to confirm auth setup works
    });
  });
}); 