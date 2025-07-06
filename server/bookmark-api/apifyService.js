const { ApifyClient } = require('apify-client');
const config = require('../../config/env');

/**
 * Generic Apify Service
 * 
 * Provides a reusable interface for running Apify actors
 * Can be used across different content intelligence modules
 */
class ApifyService {
    constructor() {
        this.apiToken = config.apify?.apiToken;
        this.actors = config.apify?.actors || {};
        
        if (this.apiToken) {
            this.client = new ApifyClient({
                token: this.apiToken,
            });
        } else {
            console.warn('⚠️ Apify API token not configured');
        }
    }

    /**
     * Check if Apify client is available
     * @returns {boolean} True if client is configured
     */
    isAvailable() {
        return !!this.client;
    }

    /**
     * Run an Apify actor with given input
     * @param {string} actorId - The Apify actor ID
     * @param {Object} input - Input data for the actor
     * @param {Object} options - Additional options
     * @returns {Promise<Array>} Array of results from the actor
     */
    async runActor(actorId, input, options = {}) {
        if (!this.client) {
            throw new Error('Apify client not configured - missing API token');
        }

        try {
            console.log(`🔄 Running Apify actor ${actorId}`);
            console.log('Input:', JSON.stringify(input, null, 2));

            // Run the Actor and wait for it to finish
            const run = await this.client.actor(actorId).call(input, {
                timeout: options.timeout || 300000, // 5 minutes default
                memory: options.memory || 1024,     // 1GB default
                ...options
            });

            console.log(`✅ Actor run completed: ${run.id}`);

            // Fetch Actor results from the run's dataset
            const { items } = await this.client.dataset(run.defaultDatasetId).listItems();

            if (!items || items.length === 0) {
                console.warn('⚠️ No data returned from Apify actor');
                return [];
            }

            console.log(`📊 Retrieved ${items.length} items from actor`);
            return items;
        } catch (error) {
            console.error(`❌ Error running Apify actor ${actorId}:`, error);
            throw new Error(`Apify actor failed: ${error.message}`);
        }
    }

    /**
     * Run Instagram scraper actor
     * @param {string} instagramUrl - Instagram URL to scrape
     * @returns {Promise<Array>} Instagram data
     */
    async runInstagramScraper(instagramUrl) {
        const actorId = this.actors.instagramScraper;
        if (!actorId) {
            throw new Error('Instagram scraper actor ID not configured');
        }

        const input = {
            url: instagramUrl
        };

        return await this.runActor(actorId, input);
    }

    /**
     * Get available actor IDs
     * @returns {Object} Object containing configured actor IDs
     */
    getActors() {
        return this.actors;
    }

    /**
     * Add or update an actor ID
     * @param {string} name - Actor name
     * @param {string} actorId - Apify actor ID
     */
    setActor(name, actorId) {
        this.actors[name] = actorId;
    }

    /**
     * Get run information
     * @param {string} runId - Apify run ID
     * @returns {Promise<Object>} Run information
     */
    async getRunInfo(runId) {
        if (!this.client) {
            throw new Error('Apify client not configured');
        }

        try {
            return await this.client.run(runId).get();
        } catch (error) {
            console.error(`Error getting run info for ${runId}:`, error);
            throw error;
        }
    }

    /**
     * Get dataset items from a specific run
     * @param {string} datasetId - Dataset ID
     * @param {Object} options - Options for fetching items
     * @returns {Promise<Array>} Dataset items
     */
    async getDatasetItems(datasetId, options = {}) {
        if (!this.client) {
            throw new Error('Apify client not configured');
        }

        try {
            const { items } = await this.client.dataset(datasetId).listItems({
                limit: options.limit || 1000,
                offset: options.offset || 0,
                ...options
            });
            return items;
        } catch (error) {
            console.error(`Error getting dataset items for ${datasetId}:`, error);
            throw error;
        }
    }
}

module.exports = ApifyService; 