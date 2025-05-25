/**
 * Migration to create Raindrop.io related tables
 * - Creates raindrop schema
 * - Creates tokens table for storing OAuth tokens
 * - Creates bookmarks table for storing synced bookmarks
 */

exports.up = function(knex) {
  return knex.schema
    // Create raindrop schema
    .raw('CREATE SCHEMA IF NOT EXISTS raindrop')
    
    // Create tokens table
    .createTable('raindrop.tokens', table => {
      table.uuid('user_id')
        .primary('tokens_pkey')
        .references('id')
        .inTable('identity.users')
        .onDelete('CASCADE');
      table.text('access_token').notNullable();
      table.text('refresh_token');
      table.timestamp('expires_at', { useTz: true });
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    })

    // Create bookmarks table
    .createTable('raindrop.bookmarks', table => {
      table.increments('id').primary();
      table.uuid('user_id')
        .references('id')
        .inTable('identity.users')
        .onDelete('CASCADE');
      table.integer('raindrop_id').notNullable();
      table.text('title');
      table.text('link').notNullable();
      table.specificType('tags', 'text[]');
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
      
      // Add indexes
      table.index('user_id');
      table.index('raindrop_id');
      table.index('created_at');
      
      // Add unique constraint to prevent duplicate bookmarks
      table.unique(['user_id', 'raindrop_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('raindrop.bookmarks')
    .dropTableIfExists('raindrop.tokens')
    .raw('DROP SCHEMA IF EXISTS raindrop CASCADE');
}; 