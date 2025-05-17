/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.raw('CREATE SCHEMA IF NOT EXISTS content');

  // Check if tables exist in public schema
  const publicAuthorsExists = await knex.raw(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'authors'
    );
  `);

  const publicPostsExists = await knex.raw(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'posts'
    );
  `);

  // Only move tables if they exist in public schema and don't exist in content schema
  if (publicAuthorsExists.rows[0].exists) {
    await knex.raw('DROP TABLE IF EXISTS content.authors');
    await knex.raw('ALTER TABLE public.authors SET SCHEMA content');
    console.log('Moved table public.authors to content.authors');
  }

  if (publicPostsExists.rows[0].exists) {
    await knex.raw('DROP TABLE IF EXISTS content.posts');
    await knex.raw('ALTER TABLE public.posts SET SCHEMA content');
    console.log('Moved table public.posts to content.posts');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Since the tables are already in content schema, we don't need to do anything in down migration
  return Promise.resolve();
}; 