/**
 * Migration: Add F5 Certainty Scoring Framework fields to bookmarks table
 * 
 * Adds intelligence_level, confidence_scores, platform_metadata, and processing_status
 * fields to support the F5 Universal Certainty Scoring Framework.
 * 
 * @param {Object} knex - Knex instance
 */
exports.up = function(knex) {
  return knex.schema.withSchema('bookmarks').table('bookmarks', function(table) {
    // Intelligence level (1-4) indicating processing depth
    table.integer('intelligence_level').defaultTo(1).comment('Processing level: 1=metadata, 2=enhanced, 3=deep, 4=manual');
    
    // Confidence scores as JSONB for detailed breakdown
    table.jsonb('confidence_scores').comment('Detailed confidence assessment with breakdown and recommendations');
    
    // Platform-specific metadata storage
    table.jsonb('platform_metadata').comment('Platform-specific extracted metadata and context');
    
    // Processing status tracking
    table.text('processing_status').defaultTo('pending').comment('Status: pending, processing, completed, failed, enhanced');
    
    // Add indexes for performance
    table.index(['intelligence_level'], 'idx_bookmarks_intelligence_level');
    table.index(['processing_status'], 'idx_bookmarks_processing_status');
    table.index(['user_id', 'intelligence_level'], 'idx_bookmarks_user_intelligence');
  });
};

/**
 * Rollback: Remove F5 certainty scoring fields
 */
exports.down = function(knex) {
  return knex.schema.withSchema('bookmarks').table('bookmarks', function(table) {
    // Drop indexes first
    table.dropIndex(['intelligence_level'], 'idx_bookmarks_intelligence_level');
    table.dropIndex(['processing_status'], 'idx_bookmarks_processing_status');
    table.dropIndex(['user_id', 'intelligence_level'], 'idx_bookmarks_user_intelligence');
    
    // Drop columns
    table.dropColumn('intelligence_level');
    table.dropColumn('confidence_scores');
    table.dropColumn('platform_metadata');
    table.dropColumn('processing_status');
  });
}; 