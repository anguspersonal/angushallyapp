/**
 * Migration to create raindrop.sync_logs table
 * - Creates sync_logs table for tracking Raindrop sync operations
 * - Includes status tracking, item counts, and error logging
 * - Adds appropriate indexes for performance
 */

exports.up = async function(knex) {
  console.log('🔄 Creating raindrop.sync_logs table...');
  
  // Check if raindrop schema exists
  const schemaExists = await knex.raw(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.schemata 
      WHERE schema_name = 'raindrop'
    )
  `);
  
  if (!schemaExists.rows[0].exists) {
    console.log('⚠️  raindrop schema does not exist, creating it first...');
    await knex.raw('CREATE SCHEMA IF NOT EXISTS raindrop');
  }
  
  // Check if sync_logs table already exists
  const tableExists = await knex.schema.withSchema('raindrop').hasTable('sync_logs');
  
  if (tableExists) {
    console.log('ℹ️  raindrop.sync_logs table already exists, skipping creation');
    return;
  }
  
  // Create sync_logs table
  await knex.schema
    .withSchema('raindrop')
    .createTable('sync_logs', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('identity.users')
        .onDelete('CASCADE');
      table.text('status')
        .notNullable()
        .comment('Sync status: success, error, partial_success');
      table.integer('item_count')
        .notNullable()
        .comment('Number of items processed in this sync');
      table.text('error_message')
        .nullable()
        .comment('Error message if sync failed');
      table.timestamp('started_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
        .comment('When sync operation started');
      table.timestamp('finished_at', { useTz: true })
        .nullable()
        .comment('When sync operation completed');
      
      // Add indexes for performance
      table.index('user_id', 'ix_raindrop_sync_logs_user_id');
      table.index('started_at', 'ix_raindrop_sync_logs_started_at');
      table.index('status', 'ix_raindrop_sync_logs_status');
    });
  
  console.log('✅ Created raindrop.sync_logs table with indexes');
  
  // Show table structure
  const columns = await knex.raw(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'raindrop' 
    AND table_name = 'sync_logs'
    ORDER BY ordinal_position
  `);
  
  console.log('📋 raindrop.sync_logs table structure:');
  columns.rows.forEach(col => {
    console.log(`   ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
  });
  
  console.log('🎉 raindrop.sync_logs table created successfully!');
};

exports.down = async function(knex) {
  console.log('⚠️  Dropping raindrop.sync_logs table...');
  
  // Drop the table
  await knex.schema.withSchema('raindrop').dropTableIfExists('sync_logs');
  
  console.log('🗑️  Dropped raindrop.sync_logs table');
}; 