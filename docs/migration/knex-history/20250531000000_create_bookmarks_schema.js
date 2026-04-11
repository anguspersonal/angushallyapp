/**
 * Migration to create the canonical bookmarks schema
 * - Creates bookmarks schema
 * - Creates canonical bookmarks table for unified bookmark storage
 * - Creates categories and bookmark_categories tables for organization
 */

exports.up = async function(knex) {
  // Create bookmarks schema if it doesn't exist
  await knex.raw('CREATE SCHEMA IF NOT EXISTS bookmarks');
  
  // Create canonical bookmarks table
  await knex.schema
    .withSchema('bookmarks')
    .createTable('bookmarks', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('identity.users')
        .onDelete('CASCADE');
      table.text('title').notNullable();
      table.text('url').notNullable();
      table.text('resolved_url');
      table.text('description');
      table.text('image_url');
      table.text('image_alt');
      table.text('site_name');
      table.specificType('tags', 'text[]');
      table.string('source_type').notNullable(); // e.g., raindrop, pocket, instapaper
      table.string('source_id').notNullable(); // ID from the original source
      table.jsonb('source_metadata');
      table.boolean('is_organized').notNullable().defaultTo(false);
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      
      // Add indexes
      table.index('user_id', 'ix_bookmarks_user_id');
      table.index('url', 'ix_bookmarks_url');
      table.index('tags', 'ix_bookmarks_tags', 'gin');
      
      // Add unique constraint to prevent duplicate bookmarks from same source
      table.unique(['source_type', 'source_id'], 'uq_bookmarks_source');
    });

  // Create categories table
  await knex.schema
    .withSchema('bookmarks')
    .createTable('categories', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('identity.users')
        .onDelete('CASCADE');
      table.string('name').notNullable();
      table.text('description');
      table.uuid('parent_id')
        .references('id')
        .inTable('bookmarks.categories')
        .onDelete('CASCADE');
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      
      // Add indexes
      table.index('user_id', 'ix_categories_user_id');
      table.index('parent_id', 'ix_categories_parent_id');
    });

  // Create bookmark_categories junction table
  await knex.schema
    .withSchema('bookmarks')
    .createTable('bookmark_categories', table => {
      table.uuid('bookmark_id')
        .notNullable()
        .references('id')
        .inTable('bookmarks.bookmarks')
        .onDelete('CASCADE');
      table.uuid('category_id')
        .notNullable()
        .references('id')
        .inTable('bookmarks.categories')
        .onDelete('CASCADE');
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      
      // Add unique constraint
      table.unique(['bookmark_id', 'category_id'], 'uq_bookmark_categories');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('bookmarks.bookmark_categories')
    .dropTableIfExists('bookmarks.categories')
    .dropTableIfExists('bookmarks.bookmarks')
    .raw('DROP SCHEMA IF EXISTS bookmarks CASCADE');
}; 