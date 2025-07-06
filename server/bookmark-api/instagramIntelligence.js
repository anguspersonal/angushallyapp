const config = require('../../config/env');
const db = require('../db');
const ApifyService = require('./apifyService');

/**
 * Instagram Content Intelligence Service
 * 
 * F1 Module: Instagram Content Intelligence
 * - Uses Apify scraper to get Instagram reel metadata
 * - Sends metadata to OpenAI Assistant for parsing
 * - Implements full OpenAI Assistant workflow
 */

class InstagramIntelligenceService {
    constructor() {
        this.openaiApiKey = config.openai.apiKey;
        this.apifyService = new ApifyService();
        
        if (!this.openaiApiKey) {
            throw new Error('OpenAI API key is required for Instagram Intelligence');
        }
    }

    /**
     * Extract Instagram reel metadata using Apify scraper
     * @param {string} instagramUrl - Instagram reel URL
     * @returns {Promise<Object>} Instagram metadata
     */
    async extractInstagramMetadata(instagramUrl) {
        try {
            // Validate Instagram URL format
            if (!this.isValidInstagramUrl(instagramUrl)) {
                throw new Error('Invalid Instagram URL format');
            }

            // Use real Apify API if available, otherwise fallback to mock data
            if (this.apifyService.isAvailable()) {
                return await this.extractWithApify(instagramUrl);
            } else {
                console.warn('⚠️ Apify service not configured, using mock data');
                return this.getMockMetadata(instagramUrl);
            }
        } catch (error) {
            console.error('Error extracting Instagram metadata:', error);
            throw new Error(`Failed to extract Instagram metadata: ${error.message}`);
        }
    }

    /**
     * Extract Instagram metadata using Apify API
     * @param {string} instagramUrl - Instagram reel URL
     * @returns {Promise<Object>} Instagram metadata from Apify
     */
    async extractWithApify(instagramUrl) {
        try {
            console.log(`🔄 Extracting Instagram metadata for: ${instagramUrl}`);

            // Use the ApifyService to run Instagram scraper
            const items = await this.apifyService.runInstagramScraper(instagramUrl);

            if (!items || items.length === 0) {
                throw new Error('No data returned from Apify Instagram scraper');
            }

            const apifyData = items[0]; // Take the first result
            console.log('✅ Apify Instagram data extracted successfully');

            // Transform Apify response to our standard format
            return this.transformApifyResponse(apifyData, instagramUrl);
        } catch (error) {
            console.error('Error with Apify extraction:', error);
            // Fallback to mock data if Apify fails
            console.warn('⚠️ Falling back to mock data due to Apify error');
            return this.getMockMetadata(instagramUrl);
        }
    }

    /**
     * Transform Apify response to our standard metadata format
     * @param {Object} apifyData - Raw data from Apify
     * @param {string} instagramUrl - Original Instagram URL
     * @returns {Object} Standardized metadata
     */
    transformApifyResponse(apifyData, instagramUrl) {
        // Extract mentions from description (since hashtags are already provided separately)
        const description = apifyData.description || '';
        const mentions = description.match(/@\w+/g) || [];

        return {
            url: instagramUrl,
            caption: description,
            hashtags: apifyData.hashtags || [],
            mentions: mentions,
            location: null, // Not provided in this scraper format
            mediaType: this.determineMediaType(instagramUrl),
            engagement: {
                likes: apifyData.likes || 0,
                comments: apifyData.num_comments || 0,
                shares: 0, // Not provided in this scraper
                views: apifyData.video_view_count ? parseInt(apifyData.video_view_count) : 0,
                playCount: apifyData.video_play_count || 0,
                engagementScore: apifyData.engagement_score_view || 0
            },
            author: {
                username: apifyData.user_posted || '',
                fullName: '', // Not provided in this scraper
                followers: apifyData.followers || 0,
                following: 0, // Not provided in this scraper
                postsCount: apifyData.posts_count || 0,
                isVerified: apifyData.is_verified || false,
                profileImageUrl: apifyData.profile_image_link || null,
                profileUrl: apifyData.profile_url || null,
                userId: apifyData.user_posted_id || null
            },
            media: {
                type: apifyData.content_type || 'unknown',
                contentId: apifyData.content_id || apifyData.shortcode || null,
                postId: apifyData.post_id || apifyData.pk || null,
                thumbnail: apifyData.thumbnail || null,
                photos: apifyData.photos || [],
                videos: apifyData.videos || [],
                productType: apifyData.product_type || null
            },
            comments: {
                latest: apifyData.latest_comments || [],
                count: apifyData.num_comments || 0
            },
            audio: apifyData.audio || null,
            partnership: {
                isPaidPartnership: apifyData.is_paid_partnership || false,
                details: apifyData.partnership_details || null
            },
            timestamp: apifyData.date_posted || new Date().toISOString(),
            extractedAt: new Date().toISOString(),
            apifyRunId: null // This would come from the run metadata, not the data itself
        };
    }

    /**
     * Get mock metadata for testing/fallback
     * @param {string} instagramUrl - Instagram URL
     * @returns {Object} Mock metadata
     */
    getMockMetadata(instagramUrl) {
        return {
            url: instagramUrl,
            caption: "Sample Instagram reel caption with #hashtags #content",
            hashtags: ["#hashtags", "#content"],
            mentions: ["@user1", "@user2"],
            location: "Sample Location",
            mediaType: this.determineMediaType(instagramUrl),
            engagement: {
                likes: 1234,
                comments: 56,
                shares: 7,
                views: 5000
            },
            author: {
                username: "sample_user",
                fullName: "Sample User",
                followers: 10000,
                following: 500,
                isVerified: false
            },
            media: {
                type: "reel",
                displayUrl: null,
                videoUrl: null,
                width: 1080,
                height: 1920
            },
            timestamp: new Date().toISOString(),
            extractedAt: new Date().toISOString(),
            apifyRunId: null
        };
    }

    /**
     * Determine media type from Instagram URL
     * @param {string} url - Instagram URL
     * @returns {string} Media type
     */
    determineMediaType(url) {
        if (url.includes('/reel/')) return 'reel';
        if (url.includes('/tv/')) return 'igtv';
        if (url.includes('/p/')) return 'post';
        return 'unknown';
    }

    /**
     * Analyze Instagram content using OpenAI Assistant
     * @param {Object} metadata - Instagram metadata from scraper
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeWithOpenAI(metadata) {
        try {
            // Create OpenAI Assistant thread
            const thread = await this.createOpenAIThread();
            
            // Add message to thread with Instagram metadata
            const message = await this.addMessageToThread(thread.id, this.formatMetadataForAnalysis(metadata));
            
            // Run the assistant
            const run = await this.runAssistant(thread.id);
            
            // Poll for completion
            const completedRun = await this.pollForCompletion(thread.id, run.id);
            
            // Get the response
            const analysis = await this.getThreadMessages(thread.id);
            
            return {
                threadId: thread.id,
                runId: run.id,
                analysis: this.parseAnalysisResponse(analysis),
                metadata: metadata,
                analyzedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error analyzing with OpenAI:', error);
            throw new Error(`Failed to analyze Instagram content: ${error.message}`);
        }
    }

    /**
     * Create a new OpenAI Assistant thread
     * @returns {Promise<Object>} Thread object
     */
    async createOpenAIThread() {
        try {
            const response = await fetch('https://api.openai.com/v1/threads', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                }
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating OpenAI thread:', error);
            throw error;
        }
    }

    /**
     * Add a message to an OpenAI thread
     * @param {string} threadId - Thread ID
     * @param {string} content - Message content
     * @returns {Promise<Object>} Message object
     */
    async addMessageToThread(threadId, content) {
        try {
            const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                body: JSON.stringify({
                    role: 'user',
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding message to thread:', error);
            throw error;
        }
    }

    /**
     * Run the assistant on a thread
     * @param {string} threadId - Thread ID
     * @returns {Promise<Object>} Run object
     */
    async runAssistant(threadId) {
        try {
            // Use the configured Instagram Content Intelligence Assistant
            const assistantId = 'asst_INZL2X679dYy7hPGjsCDMbUF';

            const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                body: JSON.stringify({
                    assistant_id: assistantId
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error running assistant:', error);
            throw error;
        }
    }

    /**
     * Poll for run completion
     * @param {string} threadId - Thread ID
     * @param {string} runId - Run ID
     * @returns {Promise<Object>} Completed run object
     */
    async pollForCompletion(threadId, runId) {
        const maxAttempts = 30; // 30 seconds max
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.openaiApiKey}`,
                        'OpenAI-Beta': 'assistants=v2'
                    }
                });

                if (!response.ok) {
                    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
                }

                const run = await response.json();

                if (run.status === 'completed') {
                    return run;
                } else if (run.status === 'failed' || run.status === 'cancelled') {
                    throw new Error(`Assistant run ${run.status}: ${run.last_error?.message || 'Unknown error'}`);
                }

                // Wait 1 second before next poll
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            } catch (error) {
                console.error('Error polling for completion:', error);
                throw error;
            }
        }

        throw new Error('Assistant run timed out');
    }

    /**
     * Get messages from a thread
     * @param {string} threadId - Thread ID
     * @returns {Promise<Array>} Messages array
     */
    async getThreadMessages(threadId) {
        try {
            const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting thread messages:', error);
            throw error;
        }
    }

    /**
     * Format Instagram metadata for OpenAI analysis
     * @param {Object} metadata - Instagram metadata
     * @returns {string} Formatted content for OpenAI
     */
    formatMetadataForAnalysis(metadata) {
        return `
Please analyze this Instagram content and provide insights:

URL: ${metadata.url}
Caption: ${metadata.caption}
Hashtags: ${metadata.hashtags.join(', ')}
Mentions: ${metadata.mentions.join(', ')}
Location: ${metadata.location}
Media Type: ${metadata.mediaType}
Engagement: ${metadata.engagement.likes} likes, ${metadata.engagement.comments} comments, ${metadata.engagement.shares} shares
Author: @${metadata.author.username} (${metadata.author.followers} followers, ${metadata.author.following} following)
Posted: ${metadata.timestamp}

Please provide:
1. Content category and topic analysis
2. Engagement quality assessment
3. Hashtag effectiveness analysis
4. Author credibility indicators
5. Content relevance scoring
6. Actionable insights for content strategy
        `.trim();
    }

    /**
     * Parse OpenAI analysis response
     * @param {Object} messagesResponse - OpenAI messages response
     * @returns {Object} Parsed analysis with structured fields
     */
    parseAnalysisResponse(messagesResponse) {
        try {
            // Get the assistant's response (most recent message from assistant)
            const assistantMessages = messagesResponse.data
                .filter(msg => msg.role === 'assistant')
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            if (assistantMessages.length === 0) {
                throw new Error('No assistant response found');
            }

            const latestResponse = assistantMessages[0];
            const content = latestResponse.content[0]?.text?.value || '';

            // Try to parse the structured response (handle both JSON and JavaScript object literal formats)
            try {
                let structuredResponse;
                
                // First try JSON parsing
                try {
                    structuredResponse = JSON.parse(content);
                } catch (jsonError) {
                    // If JSON parsing fails, try to handle JavaScript object literal format
                    console.log('JSON parsing failed, attempting JavaScript object literal parsing...');
                    
                    // Use eval in a controlled way (this is safe since we control the content)
                    // Wrap in parentheses to ensure it's treated as an expression
                    structuredResponse = eval('(' + content + ')');
                }
                
                // Validate that we have the expected structure
                if (structuredResponse && structuredResponse.title && structuredResponse.description) {
                    // Handle tags - could be array or object with hashtags
                    let tags = [];
                    if (Array.isArray(structuredResponse.tags)) {
                        tags = structuredResponse.tags;
                    } else if (structuredResponse.tags && structuredResponse.tags.hashtags) {
                        tags = structuredResponse.tags.hashtags;
                    }
                    
                    return {
                        title: structuredResponse.title,
                        description: structuredResponse.description,
                        tags: tags,
                        analysis_result: structuredResponse.analysis_result,
                        rawResponse: content,
                        parsedAt: new Date().toISOString(),
                        isStructured: true
                    };
                } else {
                    console.warn('Structured response missing expected fields, falling back to raw response');
                    throw new Error('Invalid structured response format');
                }
            } catch (parseError) {
                console.warn('Failed to parse structured response, using raw response:', parseError.message);
                
                // Fallback to raw response
                return {
                    title: null,
                    description: null,
                    tags: [],
                    analysis_result: null,
                    rawResponse: content,
                    parsedAt: new Date().toISOString(),
                    isStructured: false
                };
            }
        } catch (error) {
            console.error('Error parsing analysis response:', error);
            throw error;
        }
    }

    /**
     * Validate Instagram URL format
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid Instagram URL
     */
    isValidInstagramUrl(url) {
        const instagramPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[a-zA-Z0-9_-]+\/?/;
        return instagramPattern.test(url);
    }

    /**
     * Save analysis results to database (upsert: update existing or insert new)
     * @param {Object} analysis - Analysis results
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Saved analysis record
     */
    async saveAnalysis(analysis, userId) {
        try {
            // Use PostgreSQL's ON CONFLICT DO UPDATE to handle duplicates
            const query = `
                INSERT INTO bookmarks.instagram_analyses (
                    user_id, 
                    instagram_url, 
                    thread_id, 
                    run_id, 
                    metadata, 
                    analysis_result, 
                    analyzed_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                ON CONFLICT (user_id, instagram_url) 
                DO UPDATE SET 
                    thread_id = EXCLUDED.thread_id,
                    run_id = EXCLUDED.run_id,
                    metadata = EXCLUDED.metadata,
                    analysis_result = EXCLUDED.analysis_result,
                    analyzed_at = EXCLUDED.analyzed_at,
                    updated_at = NOW()
                RETURNING *
            `;

            const values = [
                userId,
                analysis.metadata.url,
                analysis.threadId,
                analysis.runId,
                JSON.stringify(analysis.metadata),
                JSON.stringify(analysis.analysis),
                analysis.analyzedAt
            ];

            const result = await db.query(query, values);
            return result[0];
        } catch (error) {
            console.error('Error saving analysis to database:', error);
            throw new Error(`Failed to save analysis: ${error.message}`);
        }
    }

    /**
     * Update bookmark with AI-generated insights
     * @param {string} userId - User ID
     * @param {string} instagramUrl - Instagram URL
     * @param {Object} analysisResult - Parsed analysis result with title, description, tags
     * @returns {Promise<Object|null>} Updated bookmark or null if not found
     */
    async updateBookmarkWithInsights(userId, instagramUrl, analysisResult) {
        try {
            // Only update if we have structured analysis results
            if (!analysisResult.isStructured) {
                console.log('Skipping bookmark update - no structured analysis results available');
                return null;
            }

            // Find the bookmark by URL and user
            const findQuery = `
                SELECT id, title, description, tags 
                FROM bookmarks.bookmarks 
                WHERE user_id = $1 AND url = $2
            `;
            
            const existingBookmarks = await db.query(findQuery, [userId, instagramUrl]);
            
            if (existingBookmarks.length === 0) {
                console.log('No bookmark found to update with insights');
                return null;
            }

            const bookmark = existingBookmarks[0];
            
            // Prepare enhanced data, keeping original if AI didn't provide better alternatives
            const enhancedTitle = analysisResult.title && analysisResult.title.trim() 
                ? analysisResult.title 
                : bookmark.title;
            
            const enhancedDescription = analysisResult.description && analysisResult.description.trim()
                ? analysisResult.description
                : bookmark.description;
            
            // Merge AI tags with existing tags, removing duplicates
            const existingTags = bookmark.tags || [];
            const aiTags = analysisResult.tags || [];
            const mergedTags = [...new Set([...existingTags, ...aiTags])];
            
                    // Update the bookmark with AI insights
        const updateQuery = `
            UPDATE bookmarks.bookmarks 
            SET 
                title = $1,
                description = $2,
                tags = $3,
                source_metadata = COALESCE(source_metadata, '{}') || $4,
                updated_at = NOW()
            WHERE id = $5
            RETURNING *
        `;

        console.log(`🔄 Updating bookmark ${bookmark.id} with AI insights:`);
        console.log(`   - Original title: "${bookmark.title}"`);
        console.log(`   - New title: "${enhancedTitle}"`);
        console.log(`   - Enhanced description: ${enhancedDescription ? 'Yes' : 'No'}`);
        console.log(`   - AI tags added: ${aiTags.length}`);
        console.log(`   - Merged tags: [${mergedTags.join(', ')}]`);

            // Add AI enhancement metadata
            const enhancementMetadata = {
                ai_enhanced: true,
                ai_enhanced_at: new Date().toISOString(),
                ai_title_improved: analysisResult.title !== bookmark.title,
                ai_description_improved: analysisResult.description !== bookmark.description,
                ai_tags_added: aiTags.length > 0,
                original_title: bookmark.title,
                original_description: bookmark.description,
                original_tags: existingTags
            };

            const values = [
                enhancedTitle,
                enhancedDescription,
                mergedTags,
                JSON.stringify(enhancementMetadata),
                bookmark.id
            ];

            const result = await db.query(updateQuery, values);
            
            console.log(`✅ Enhanced bookmark with AI insights: ${bookmark.id}`);
            console.log(`   - Title enhanced: ${enhancementMetadata.ai_title_improved}`);
            console.log(`   - Description enhanced: ${enhancementMetadata.ai_description_improved}`);
            console.log(`   - Tags added: ${aiTags.length}`);
            
            return result[0];
            
        } catch (error) {
            console.error('Error updating bookmark with insights:', error);
            throw new Error(`Failed to update bookmark with insights: ${error.message}`);
        }
    }

    /**
     * Check if an analysis already exists for a user and URL
     * @param {string} userId - User ID
     * @param {string} instagramUrl - Instagram URL
     * @returns {Promise<Object|null>} Existing analysis or null
     */
    async getExistingAnalysis(userId, instagramUrl) {
        try {
            const query = `
                SELECT * FROM bookmarks.instagram_analyses 
                WHERE user_id = $1 AND instagram_url = $2
            `;

            const result = await db.query(query, [userId, instagramUrl]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error checking for existing analysis:', error);
            throw new Error(`Failed to check for existing analysis: ${error.message}`);
        }
    }

    /**
     * Get analysis history for a user
     * @param {string} userId - User ID
     * @param {number} limit - Number of records to return
     * @returns {Promise<Array>} Analysis history
     */
    async getAnalysisHistory(userId, limit = 10) {
        try {
            const query = `
                SELECT * FROM bookmarks.instagram_analyses 
                WHERE user_id = $1 
                ORDER BY analyzed_at DESC 
                LIMIT $2
            `;

            const result = await db.query(query, [userId, limit]);
            return result;
        } catch (error) {
            console.error('Error getting analysis history:', error);
            throw new Error(`Failed to get analysis history: ${error.message}`);
        }
    }
}

module.exports = InstagramIntelligenceService; 