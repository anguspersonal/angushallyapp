/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create content schema if it doesn't exist
  await knex.raw('CREATE SCHEMA IF NOT EXISTS content');

  // Check if tables exist in public schema
  const publicAuthorsExists = await knex.schema.withSchema('public').hasTable('authors');
  const publicPostsExists = await knex.schema.withSchema('public').hasTable('posts');

  if (publicAuthorsExists) {
    // Create authors table in content schema
    await knex.raw(`
      CREATE TABLE IF NOT EXISTS content.authors (
        LIKE public.authors INCLUDING ALL
      )
    `);
    
    // Copy data
    await knex.raw(`
      INSERT INTO content.authors 
      SELECT * FROM public.authors
    `);

    // Drop old table
    await knex.raw('DROP TABLE IF EXISTS public.authors');
    console.log('Moved authors table from public to content schema');
  } else {
    // Create new authors table if it doesn't exist anywhere
    await knex.schema.withSchema('content').createTable('authors', table => {
      table.uuid('id').primary();
      table.string('name').notNullable();
      table.string('bio');
      table.string('avatar_url');
      table.timestamps(true, true);
    });
    console.log('Created new authors table in content schema');
  }

  if (publicPostsExists) {
    // Create posts table in content schema
    await knex.raw(`
      CREATE TABLE IF NOT EXISTS content.posts (
        LIKE public.posts INCLUDING ALL
      )
    `);
    
    // Copy data
    await knex.raw(`
      INSERT INTO content.posts 
      SELECT * FROM public.posts
    `);

    // Drop old table
    await knex.raw('DROP TABLE IF EXISTS public.posts');
    console.log('Moved posts table from public to content schema');
  } else {
    // Create new posts table if it doesn't exist anywhere
    await knex.schema.withSchema('content').createTable('posts', table => {
      table.uuid('id').primary();
      table.string('title').notNullable();
      table.string('slug').notNullable().unique();
      table.text('content').notNullable();
      table.text('excerpt');
      table.string('cover_image');
      table.string('alt_text');
      table.string('attribution');
      table.string('attribution_link');
      table.uuid('author_id').references('id').inTable('content.authors');
      table.timestamps(true, true);
    });
    console.log('Created new posts table in content schema');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Move tables back to public schema if they exist in content
  const contentAuthorsExists = await knex.schema.withSchema('content').hasTable('authors');
  const contentPostsExists = await knex.schema.withSchema('content').hasTable('posts');

  if (contentAuthorsExists) {
    await knex.raw(`
      CREATE TABLE IF NOT EXISTS public.authors (
        LIKE content.authors INCLUDING ALL
      )
    `);
    
    await knex.raw(`
      INSERT INTO public.authors 
      SELECT * FROM content.authors
    `);

    await knex.raw('DROP TABLE IF EXISTS content.authors');
    console.log('Moved authors table back to public schema');
  }

  if (contentPostsExists) {
    await knex.raw(`
      CREATE TABLE IF NOT EXISTS public.posts (
        LIKE content.posts INCLUDING ALL
      )
    `);
    
    await knex.raw(`
      INSERT INTO public.posts 
      SELECT * FROM content.posts
    `);

    await knex.raw('DROP TABLE IF EXISTS content.posts');
    console.log('Moved posts table back to public schema');
  }

  // Drop content schema if it's empty
  await knex.raw(`
    DO $$
    BEGIN
      IF (SELECT COUNT(*) = 0 FROM information_schema.tables WHERE table_schema = 'content') THEN
        DROP SCHEMA content;
      END IF;
    END $$;
  `);
}; 