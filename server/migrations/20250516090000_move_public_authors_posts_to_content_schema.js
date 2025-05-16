/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Create the new 'content' schema if it doesn't exist
  await knex.raw('CREATE SCHEMA IF NOT EXISTS content');

  // 2. Move public.authors to content.authors
  // First, check if public.authors exists before trying to alter it
  const authorsTableExists = await knex.schema.withSchema('public').hasTable('authors');
  if (authorsTableExists) {
    await knex.raw('ALTER TABLE public.authors SET SCHEMA content');
    console.log('Moved table public.authors to content.authors');
  } else {
    console.log('Table public.authors does not exist, skipping move.');
  }

  // 3. Move public.posts to content.posts
  // First, check if public.posts exists
  const postsTableExists = await knex.schema.withSchema('public').hasTable('posts');
  if (postsTableExists) {
    // If posts.author_id has an FK to public.authors, it will now be to content.authors
    // as both are moved. If the FK was named, its schema might also update or need adjustment.
    // PostgreSQL handles this schema change for the FK if the referenced table is also moved.
    await knex.raw('ALTER TABLE public.posts SET SCHEMA content');
    console.log('Moved table public.posts to content.posts');
  } else {
    console.log('Table public.posts does not exist, skipping move.');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Revert the schema changes: move tables back to 'public' schema

  // 1. Move content.posts back to public.posts
  const postsTableExistsInContent = await knex.schema.withSchema('content').hasTable('posts');
  if (postsTableExistsInContent) {
    await knex.raw('ALTER TABLE content.posts SET SCHEMA public');
    console.log('Moved table content.posts back to public.posts');
  } else {
    console.log('Table content.posts does not exist, skipping move back.');
  }

  // 2. Move content.authors back to public.authors
  const authorsTableExistsInContent = await knex.schema.withSchema('content').hasTable('authors');
  if (authorsTableExistsInContent) {
    await knex.raw('ALTER TABLE content.authors SET SCHEMA public');
    console.log('Moved table content.authors back to public.authors');
  } else {
    console.log('Table content.authors does not exist, skipping move back.');
  }
  
  // 3. Optionally, drop the 'content' schema if it's empty and was created by this migration.
  // This is safer done manually or as a separate migration after verifying it's truly empty.
  // For now, we won't automatically drop it to prevent accidental data loss if other objects were in it.
  // Example if you wanted to conditionally drop it:
  // const tablesInContent = await knex('pg_catalog.pg_tables').where('schemaname', 'content').count('*');
  // if (tablesInContent[0].count === '0') { // Check if any tables are left
  //   await knex.raw('DROP SCHEMA IF EXISTS content');
  //   console.log('Schema content dropped as it was empty.');
  // } else {
  //   console.log('Schema content was not dropped as it still contains objects.');
  // }
}; 