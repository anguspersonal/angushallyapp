exports.up = function(knex) {
  return knex.schema
    .withSchema('bookmark')
    .alterTable('bookmarks', table => {
      // Basic metadata
      table.text('type').comment('og:type - article, website, etc.');
      table.text('locale').comment('og:locale - language/region information');
      
      // Media metadata
      table.text('image_alt').comment('og:image:alt - alternative text for the image');
      table.text('video_url').comment('og:video - URL of video content if present');
      table.text('audio_url').comment('og:audio - URL of audio content if present');
      
      // Article-specific metadata
      table.timestamp('published_time').comment('article:published_time - when the article was published');
      table.text('author').comment('article:author - author of the article');
      table.text('section').comment('article:section - section/category of the article');
      
      // Technical metadata
      table.text('metadata_source').comment('Source of metadata (OG/Twitter/HTML)');
      table.jsonb('raw_metadata').comment('Raw metadata response for future use');
    });
};

exports.down = function(knex) {
  return knex.schema
    .withSchema('bookmark')
    .alterTable('bookmarks', table => {
      // Basic metadata
      table.dropColumn('type');
      table.dropColumn('locale');
      
      // Media metadata
      table.dropColumn('image_alt');
      table.dropColumn('video_url');
      table.dropColumn('audio_url');
      
      // Article-specific metadata
      table.dropColumn('published_time');
      table.dropColumn('author');
      table.dropColumn('section');
      
      // Technical metadata
      table.dropColumn('metadata_source');
      table.dropColumn('raw_metadata');
    });
}; 