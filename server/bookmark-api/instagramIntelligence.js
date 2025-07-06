const config = require('../../config/env');
const db = require('../db');

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
        this.apifyApiKey = config.apify?.apiKey;
        
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

            // TODO: Implement Apify API call when API key is available
            // For now, return mock data structure
            const mockMetadata = {
                url: instagramUrl,
                caption: "Sample Instagram reel caption with #hashtags",
                hashtags: ["#sample", "#instagram", "#reel"],
                mentions: ["@user1", "@user2"],
                location: "Sample Location",
                mediaType: "reel",
                engagement: {
                    likes: 1234,
                    comments: 56,
                    shares: 7
                },
                author: {
                    username: "sample_user",
                    followers: 10000,
                    following: 500
                },
                timestamp: new Date().toISOString(),
                extractedAt: new Date().toISOString()
            };

            return mockMetadata;
        } catch (error) {
            console.error('Error extracting Instagram metadata:', error);
            throw new Error(`Failed to extract Instagram metadata: ${error.message}`);
        }
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
                    'OpenAI-Beta': 'assistants=v1'
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
                    'OpenAI-Beta': 'assistants=v1'
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
            // TODO: Create or use existing assistant ID
            const assistantId = 'asst_placeholder'; // This should be configured

            const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v1'
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
                        'OpenAI-Beta': 'assistants=v1'
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
                    'OpenAI-Beta': 'assistants=v1'
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
     * @returns {Object} Parsed analysis
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

            // TODO: Implement structured parsing of the response
            // For now, return the raw response
            return {
                rawResponse: content,
                parsedAt: new Date().toISOString()
            };
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
     * Save analysis results to database
     * @param {Object} analysis - Analysis results
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Saved analysis record
     */
    async saveAnalysis(analysis, userId) {
        try {
            const query = `
                INSERT INTO bookmarks.instagram_analyses (
                    user_id, 
                    instagram_url, 
                    thread_id, 
                    run_id, 
                    metadata, 
                    analysis_result, 
                    analyzed_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
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
            return result.rows[0];
        } catch (error) {
            console.error('Error saving analysis to database:', error);
            throw new Error(`Failed to save analysis: ${error.message}`);
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
            return result.rows;
        } catch (error) {
            console.error('Error getting analysis history:', error);
            throw new Error(`Failed to get analysis history: ${error.message}`);
        }
    }
}

module.exports = InstagramIntelligenceService; 