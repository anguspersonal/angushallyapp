exports.up = function(knex) {
  return knex.schema
    .withSchema('bookmark')
    .alterTable('bookmarks', table => {
      table.text('image_url').comment('URL of the image associated with the bookmark');
    });
};

exports.down = function(knex) {
  return knex.schema
    .withSchema('bookmark')
    .alterTable('bookmarks', table => {
      table.dropColumn('image_url');
    });
}; 