/**
 * F5 - Universal Certainty Scoring Framework API Routes
 * 
 * Provides endpoints for confidence assessment, metadata validation,
 * and certainty scoring operations.
 * 
 * @module f5-certainty-route
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { 
  calculateConfidenceScore, 
  getConfidenceLevel, 
  validateMetadata,
  saveConfidenceAssessment,
  getConfidenceAssessment 
} = require('../bookmark-api/f5-certainty-scoring/certaintyScoring');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/f5/assess
 * Calculate confidence score for metadata
 */
router.post('/assess', async (req, res) => {
  try {
    const { metadata, context } = req.body;
    const userId = req.user.id;

    if (!metadata) {
      return res.status(400).json({
        error: 'Missing required parameter: metadata'
      });
    }

    // Calculate confidence score
    const assessment = calculateConfidenceScore(metadata, context);
    
    // Add confidence level category
    assessment.confidenceLevel = getConfidenceLevel(assessment.overallScore);
    
    // Add timestamp
    assessment.timestamp = new Date().toISOString();

    res.json({
      success: true,
      assessment,
      message: `Confidence assessment completed: ${assessment.confidenceLevel} (${assessment.overallScore}%)`
    });

  } catch (error) {
    console.error('Error in F5 assess endpoint:', error);
    res.status(500).json({
      error: 'Failed to calculate confidence score',
      details: error.message
    });
  }
});

/**
 * POST /api/f5/validate
 * Validate metadata against platform-specific rules
 */
router.post('/validate', async (req, res) => {
  try {
    const { metadata, platform } = req.body;
    const userId = req.user.id;

    if (!metadata) {
      return res.status(400).json({
        error: 'Missing required parameter: metadata'
      });
    }

    if (!platform) {
      return res.status(400).json({
        error: 'Missing required parameter: platform'
      });
    }

    // Validate metadata
    const validation = validateMetadata(metadata, platform);
    
    res.json({
      success: true,
      validation,
      message: validation.isValid ? 'Metadata validation passed' : 'Metadata validation failed'
    });

  } catch (error) {
    console.error('Error in F5 validate endpoint:', error);
    res.status(500).json({
      error: 'Failed to validate metadata',
      details: error.message
    });
  }
});

/**
 * POST /api/f5/bookmark/:bookmarkId/assess
 * Assess and save confidence score for a specific bookmark
 */
router.post('/bookmark/:bookmarkId/assess', async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const { metadata, context } = req.body;
    const userId = req.user.id;

    if (!metadata) {
      return res.status(400).json({
        error: 'Missing required parameter: metadata'
      });
    }

    // Calculate confidence score
    const assessment = calculateConfidenceScore(metadata, context);
    assessment.confidenceLevel = getConfidenceLevel(assessment.overallScore);
    assessment.timestamp = new Date().toISOString();

    // Save to database
    const saved = await saveConfidenceAssessment(bookmarkId, assessment, userId);
    
    if (!saved) {
      return res.status(404).json({
        error: 'Bookmark not found or access denied'
      });
    }

    res.json({
      success: true,
      assessment,
      message: `Confidence assessment saved for bookmark ${bookmarkId}`
    });

  } catch (error) {
    console.error('Error in F5 bookmark assess endpoint:', error);
    res.status(500).json({
      error: 'Failed to assess and save confidence score',
      details: error.message
    });
  }
});

/**
 * GET /api/f5/bookmark/:bookmarkId/assessment
 * Get confidence assessment for a specific bookmark
 */
router.get('/bookmark/:bookmarkId/assessment', async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const userId = req.user.id;

    const assessment = await getConfidenceAssessment(bookmarkId, userId);
    
    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found or access denied'
      });
    }

    res.json({
      success: true,
      assessment
    });

  } catch (error) {
    console.error('Error in F5 get assessment endpoint:', error);
    res.status(500).json({
      error: 'Failed to retrieve confidence assessment',
      details: error.message
    });
  }
});

/**
 * GET /api/f5/bookmarks/confidence-stats
 * Get confidence statistics for user's bookmarks
 */
router.get('/bookmarks/confidence-stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // Query confidence statistics
    const query = `
      SELECT 
        COUNT(*) as total_bookmarks,
        AVG(intelligence_level) as avg_intelligence_level,
        COUNT(CASE WHEN confidence_scores IS NOT NULL THEN 1 END) as assessed_bookmarks,
        COUNT(CASE WHEN confidence_scores->>'overallScore' >= '80' THEN 1 END) as high_confidence,
        COUNT(CASE WHEN confidence_scores->>'overallScore' >= '50' AND confidence_scores->>'overallScore' < '80' THEN 1 END) as medium_confidence,
        COUNT(CASE WHEN confidence_scores->>'overallScore' < '50' THEN 1 END) as low_confidence,
        AVG(CAST(confidence_scores->>'overallScore' AS NUMERIC)) as avg_confidence_score
      FROM bookmarks.bookmarks 
      WHERE user_id = $1
    `;

    const result = await require('../db').query(query, [userId]);
    const stats = result.rows[0];

    res.json({
      success: true,
      stats: {
        totalBookmarks: parseInt(stats.total_bookmarks) || 0,
        assessedBookmarks: parseInt(stats.assessed_bookmarks) || 0,
        averageIntelligenceLevel: parseFloat(stats.avg_intelligence_level) || 1,
        averageConfidenceScore: parseFloat(stats.avg_confidence_score) || 0,
        confidenceDistribution: {
          high: parseInt(stats.high_confidence) || 0,
          medium: parseInt(stats.medium_confidence) || 0,
          low: parseInt(stats.low_confidence) || 0
        }
      }
    });

  } catch (error) {
    console.error('Error in F5 confidence stats endpoint:', error);
    res.status(500).json({
      error: 'Failed to retrieve confidence statistics',
      details: error.message
    });
  }
});

/**
 * POST /api/f5/bookmarks/bulk-assess
 * Bulk assess multiple bookmarks
 */
router.post('/bookmarks/bulk-assess', async (req, res) => {
  try {
    const { bookmarks } = req.body;
    const userId = req.user.id;

    if (!bookmarks || !Array.isArray(bookmarks)) {
      return res.status(400).json({
        error: 'Missing or invalid parameter: bookmarks array'
      });
    }

    const results = [];
    const errors = [];

    for (const bookmark of bookmarks) {
      try {
        const { bookmarkId, metadata, context } = bookmark;
        
        if (!bookmarkId || !metadata) {
          errors.push({ bookmarkId, error: 'Missing required fields' });
          continue;
        }

        // Calculate confidence score
        const assessment = calculateConfidenceScore(metadata, context);
        assessment.confidenceLevel = getConfidenceLevel(assessment.overallScore);
        assessment.timestamp = new Date().toISOString();

        // Save to database
        const saved = await saveConfidenceAssessment(bookmarkId, assessment, userId);
        
        if (saved) {
          results.push({ bookmarkId, assessment });
        } else {
          errors.push({ bookmarkId, error: 'Bookmark not found or access denied' });
        }

      } catch (error) {
        errors.push({ 
          bookmarkId: bookmark.bookmarkId, 
          error: error.message 
        });
      }
    }

    res.json({
      success: true,
      results: {
        processed: results.length,
        errors: errors.length,
        assessments: results,
        errorDetails: errors
      },
      message: `Bulk assessment completed: ${results.length} successful, ${errors.length} errors`
    });

  } catch (error) {
    console.error('Error in F5 bulk assess endpoint:', error);
    res.status(500).json({
      error: 'Failed to perform bulk assessment',
      details: error.message
    });
  }
});

module.exports = router; 