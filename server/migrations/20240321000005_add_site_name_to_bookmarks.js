/**
 * Migration to add site_name column to bookmark.bookmarks table
 */

exports.up = function(knex) {
  return knex.schema
    .withSchema('bookmark')
    .alterTable('bookmarks', table => {
      table.text('site_name').comment('Website name from og:site_name');
    });
};

exports.down = function(knex) {
  return knex.schema
    .withSchema('bookmark')
    .alterTable('bookmarks', table => {
      table.dropColumn('site_name');
    });
}; 