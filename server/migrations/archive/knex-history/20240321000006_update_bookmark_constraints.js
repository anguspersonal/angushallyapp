/**
 * Migration to update bookmark constraints:
 * 1. Add unique constraint on (user_id, url)
 * 2. Remove any source-related constraints
 */

exports.up = function(knex) {
  return knex.schema
    .withSchema('bookmark')
    .alterTable('bookmarks', table => {
      // Add unique constraint for user_id and url
      table.unique(['user_id', 'url'], 'uq_bookmarks_user_url');
      
      // Drop any existing source-related constraints if they exist
      // Note: This is a no-op if the constraints don't exist
      knex.raw('ALTER TABLE bookmark.bookmarks DROP CONSTRAINT IF EXISTS uq_bookmarks_source');
    });
};

exports.down = function(knex) {
  return knex.schema
    .withSchema('bookmark')
    .alterTable('bookmarks', table => {
      // Remove the unique constraint we added
      table.dropUnique(['user_id', 'url'], 'uq_bookmarks_user_url');
      
      // Note: We don't restore the source constraint in down migration
      // as it was removed in a previous migration
    });
}; 