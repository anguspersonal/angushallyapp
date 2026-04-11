exports.up = async function(knex) {
  // Create raindrop schema if it doesn't exist
  await knex.raw('CREATE SCHEMA IF NOT EXISTS raindrop');
  
  // Check if tokens table exists
  const tokensExists = await knex.schema.withSchema('raindrop').hasTable('tokens');
  
  if (!tokensExists) {
    // Create tokens table
    await knex.schema.withSchema('raindrop').createTable('tokens', table => {
      table.uuid('user_id').primary().references('id').inTable('identity.users').onDelete('CASCADE');
      table.text('access_token').notNullable();
      table.text('refresh_token').notNullable();
      table.timestamp('expires_at').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }
  
  // Check if bookmarks table exists
  const bookmarksExists = await knex.schema.withSchema('raindrop').hasTable('bookmarks');
  
  if (!bookmarksExists) {
    // Create bookmarks table
    await knex.schema.withSchema('raindrop').createTable('bookmarks', table => {
      table.increments('id').primary();
      table.uuid('user_id').notNullable().references('id').inTable('identity.users').onDelete('CASCADE');
      table.string('raindrop_id').notNullable();
      table.text('title').notNullable();
      table.text('link').notNullable();
      table.specificType('tags', 'text[]');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Composite unique constraint to prevent duplicate bookmarks
      table.unique(['user_id', 'raindrop_id']);
      
      // Indexes for performance
      table.index('user_id');
      table.index('created_at');
    });
  }
  
  // Check if collections table exists
  const collectionsExists = await knex.schema.withSchema('raindrop').hasTable('collections');
  
  if (!collectionsExists) {
    // Create collections table (for future use)
    await knex.schema.withSchema('raindrop').createTable('collections', table => {
      table.increments('id').primary();
      table.uuid('user_id').notNullable().references('id').inTable('identity.users').onDelete('CASCADE');
      table.string('raindrop_id').notNullable();
      table.string('title').notNullable();
      table.integer('count').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Composite unique constraint
      table.unique(['user_id', 'raindrop_id']);
      
      // Index for performance
      table.index('user_id');
    });
  }
};

exports.down = async function(knex) {
  // Drop tables in reverse order due to foreign key constraints
  await knex.schema.withSchema('raindrop').dropTableIfExists('collections');
  await knex.schema.withSchema('raindrop').dropTableIfExists('bookmarks');
  await knex.schema.withSchema('raindrop').dropTableIfExists('tokens');
  
  // Drop the schema only if it's empty
  const result = await knex.raw(`
    SELECT COUNT(*) as table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'raindrop'
  `);
  
  if (result.rows[0].table_count === 0) {
    await knex.raw('DROP SCHEMA IF EXISTS raindrop CASCADE');
  }
}; 