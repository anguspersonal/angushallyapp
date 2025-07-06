const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const InstagramIntelligenceService = require('../bookmark-api/instagramIntelligence');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware());

/**
 * @route POST /api/instagram-intelligence/analyze
 * @desc Analyze Instagram content using OpenAI Assistant
 * @access Private
 */
router.post('/analyze', async (req, res) => {
    try {
        const { instagramUrl } = req.body;
        const userId = req.user.id;

        // Validate required parameters
        if (!instagramUrl) {
            return res.status(400).json({
                error: 'Missing required parameter: instagramUrl'
            });
        }

        // Initialize the Instagram Intelligence service
        const instagramService = new InstagramIntelligenceService();

        // Check if analysis already exists
        const existingAnalysis = await instagramService.getExistingAnalysis(userId, instagramUrl);

        // Extract Instagram metadata
        const metadata = await instagramService.extractInstagramMetadata(instagramUrl);

        // Analyze with OpenAI
        const analysis = await instagramService.analyzeWithOpenAI(metadata);

        // Save analysis to database (upsert: update existing or create new)
        const savedAnalysis = await instagramService.saveAnalysis(analysis, userId);

        // Update the bookmark with AI-generated insights (title, description, tags)
        const enhancedBookmark = await instagramService.updateBookmarkWithInsights(
            userId, 
            instagramUrl, 
            analysis.analysis
        );

        const isUpdate = existingAnalysis !== null;
        const isEnhanced = enhancedBookmark !== null && analysis.analysis.isStructured;
        
        let message = isUpdate 
            ? 'Instagram content re-analyzed and updated successfully'
            : 'Instagram content analyzed successfully';
        
        if (isEnhanced) {
            message += ' - Bookmark enhanced with AI insights';
        }

        res.json({
            success: true,
            data: {
                analysis: savedAnalysis,
                metadata: metadata,
                enhancedBookmark: enhancedBookmark,
                isUpdate: isUpdate,
                isEnhanced: isEnhanced,
                message: message
            }
        });

    } catch (error) {
        console.error('Instagram Intelligence analysis error:', error);
        res.status(500).json({
            error: `Failed to analyze Instagram content: ${error.message}`
        });
    }
});

/**
 * @route GET /api/instagram-intelligence/history
 * @desc Get analysis history for the authenticated user
 * @access Private
 */
router.get('/history', async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;

        // Validate limit parameter
        if (limit < 1 || limit > 100) {
            return res.status(400).json({
                error: 'Limit must be between 1 and 100'
            });
        }

        // Initialize the Instagram Intelligence service
        const instagramService = new InstagramIntelligenceService();

        // Get analysis history
        const history = await instagramService.getAnalysisHistory(userId, limit);

        res.json({
            success: true,
            data: {
                history: history,
                count: history.length,
                message: 'Analysis history retrieved successfully'
            }
        });

    } catch (error) {
        console.error('Instagram Intelligence history error:', error);
        res.status(500).json({
            error: `Failed to retrieve analysis history: ${error.message}`
        });
    }
});

/**
 * @route GET /api/instagram-intelligence/analysis/:id
 * @desc Get specific analysis by ID
 * @access Private
 */
router.get('/analysis/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const analysisId = req.params.id;

        // Validate analysis ID
        if (!analysisId) {
            return res.status(400).json({
                error: 'Missing required parameter: analysis ID'
            });
        }

        // Query database for specific analysis
        const query = `
            SELECT * FROM bookmarks.instagram_analyses 
            WHERE id = $1 AND user_id = $2
        `;

        const result = await require('../db').query(query, [analysisId, userId]);

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Analysis not found or access denied'
            });
        }

        res.json({
            success: true,
            data: {
                analysis: result[0],
                message: 'Analysis retrieved successfully'
            }
        });

    } catch (error) {
        console.error('Instagram Intelligence get analysis error:', error);
        res.status(500).json({
            error: `Failed to retrieve analysis: ${error.message}`
        });
    }
});

/**
 * @route POST /api/instagram-intelligence/extract-metadata
 * @desc Extract Instagram metadata only (without OpenAI analysis)
 * @access Private
 */
router.post('/extract-metadata', async (req, res) => {
    try {
        const { instagramUrl } = req.body;

        // Validate required parameters
        if (!instagramUrl) {
            return res.status(400).json({
                error: 'Missing required parameter: instagramUrl'
            });
        }

        // Initialize the Instagram Intelligence service
        const instagramService = new InstagramIntelligenceService();

        // Extract Instagram metadata only
        const metadata = await instagramService.extractInstagramMetadata(instagramUrl);

        res.json({
            success: true,
            data: {
                metadata: metadata,
                message: 'Instagram metadata extracted successfully'
            }
        });

    } catch (error) {
        console.error('Instagram metadata extraction error:', error);
        res.status(500).json({
            error: `Failed to extract Instagram metadata: ${error.message}`
        });
    }
});

/**
 * @route DELETE /api/instagram-intelligence/analysis/:id
 * @desc Delete specific analysis by ID
 * @access Private
 */
router.delete('/analysis/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const analysisId = req.params.id;

        // Validate analysis ID
        if (!analysisId) {
            return res.status(400).json({
                error: 'Missing required parameter: analysis ID'
            });
        }

        // Delete analysis from database
        const query = `
            DELETE FROM bookmarks.instagram_analyses 
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;

        const result = await require('../db').query(query, [analysisId, userId]);

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Analysis not found or access denied'
            });
        }

        res.json({
            success: true,
            data: {
                deletedAnalysis: result[0],
                message: 'Analysis deleted successfully'
            }
        });

    } catch (error) {
        console.error('Instagram Intelligence delete analysis error:', error);
        res.status(500).json({
            error: `Failed to delete analysis: ${error.message}`
        });
    }
});

module.exports = router; 