/**
 * Migration: Create Instagram Analyses Table
 * 
 * F1 Module: Instagram Content Intelligence
 * Creates table to store Instagram content analysis results
 */

exports.up = async function(knex) {
    // Create instagram_analyses table in bookmarks schema
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS bookmarks.instagram_analyses (
            id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
            instagram_url TEXT NOT NULL,
            thread_id TEXT NOT NULL,
            run_id TEXT NOT NULL,
            metadata JSONB NOT NULL,
            analysis_result JSONB NOT NULL,
            analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );

        -- Create indexes for performance
        CREATE INDEX IF NOT EXISTS idx_instagram_analyses_user_id ON bookmarks.instagram_analyses(user_id);
        CREATE INDEX IF NOT EXISTS idx_instagram_analyses_analyzed_at ON bookmarks.instagram_analyses(analyzed_at DESC);
        CREATE INDEX IF NOT EXISTS idx_instagram_analyses_thread_id ON bookmarks.instagram_analyses(thread_id);
        CREATE INDEX IF NOT EXISTS idx_instagram_analyses_run_id ON bookmarks.instagram_analyses(run_id);

        -- Create unique constraint to prevent duplicate analyses for same URL per user
        CREATE UNIQUE INDEX IF NOT EXISTS idx_instagram_analyses_user_url_unique 
        ON bookmarks.instagram_analyses(user_id, instagram_url);

        -- Add comments for documentation
        COMMENT ON TABLE bookmarks.instagram_analyses IS 'Stores Instagram content intelligence analysis results';
        COMMENT ON COLUMN bookmarks.instagram_analyses.user_id IS 'Reference to the user who requested the analysis';
        COMMENT ON COLUMN bookmarks.instagram_analyses.instagram_url IS 'The Instagram URL that was analyzed';
        COMMENT ON COLUMN bookmarks.instagram_analyses.thread_id IS 'OpenAI Assistant thread ID for the analysis';
        COMMENT ON COLUMN bookmarks.instagram_analyses.run_id IS 'OpenAI Assistant run ID for the analysis';
        COMMENT ON COLUMN bookmarks.instagram_analyses.metadata IS 'Raw Instagram metadata extracted from the URL';
        COMMENT ON COLUMN bookmarks.instagram_analyses.analysis_result IS 'OpenAI Assistant analysis results';
        COMMENT ON COLUMN bookmarks.instagram_analyses.analyzed_at IS 'Timestamp when the analysis was completed';
    `);
};

exports.down = async function(knex) {
    // Drop the instagram_analyses table
    await knex.raw(`
        DROP TABLE IF EXISTS bookmarks.instagram_analyses CASCADE;
    `);
}; 