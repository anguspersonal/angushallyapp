/**
 * Migration to add missing columns to raindrop.bookmarks
 * - Adds description TEXT column
 * - Adds is_organized BOOLEAN column with default false
 * - Updates existing records to set default values
 */

exports.up = async function(knex) {
  console.log('🔄 Adding missing columns to raindrop.bookmarks...');
  
  // Check if raindrop.bookmarks table exists
  const tableExists = await knex.schema.withSchema('raindrop').hasTable('bookmarks');
  
  if (!tableExists) {
    console.log('ℹ️  raindrop.bookmarks table does not exist, skipping migration');
    return;
  }
  
  // Check existing columns
  const columns = await knex.raw(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'raindrop' 
    AND table_name = 'bookmarks'
  `);
  
  const existingColumns = columns.rows.map(row => row.column_name);
  console.log('📋 Existing columns:', existingColumns.join(', '));
  
  // Add description column if it doesn't exist
  if (!existingColumns.includes('description')) {
    console.log('➕ Adding description column...');
    await knex.schema.withSchema('raindrop').alterTable('bookmarks', table => {
      table.text('description');
    });
    console.log('✅ Added description TEXT column');
  } else {
    console.log('ℹ️  description column already exists');
  }
  
  // Handle is_organised -> is_organized migration
  if (existingColumns.includes('is_organised') && !existingColumns.includes('is_organized')) {
    console.log('🔄 Migrating is_organised to is_organized (British -> American spelling)...');
    
    // Add new column
    await knex.schema.withSchema('raindrop').alterTable('bookmarks', table => {
      table.boolean('is_organized').notNullable().defaultTo(false);
    });
    
    // Copy data from old column to new column
    const updateResult = await knex.raw(`
      UPDATE raindrop.bookmarks 
      SET is_organized = COALESCE(is_organised, false)
    `);
    
    console.log(`✅ Migrated data from is_organised to is_organized`);
    
    // Drop old column
    await knex.schema.withSchema('raindrop').alterTable('bookmarks', table => {
      table.dropColumn('is_organised');
    });
    
    console.log('🗑️  Dropped old is_organised column');
    
  } else if (!existingColumns.includes('is_organized')) {
    console.log('➕ Adding is_organized column...');
    await knex.schema.withSchema('raindrop').alterTable('bookmarks', table => {
      table.boolean('is_organized').notNullable().defaultTo(false);
    });
    
    // Update existing records to set default value
    const updateResult = await knex('raindrop.bookmarks')
      .whereNull('is_organized')
      .update({ is_organized: false });
    
    console.log(`✅ Added is_organized BOOLEAN column and updated ${updateResult} existing records`);
  } else {
    console.log('ℹ️  is_organized column already exists');
  }
  
  // Get final column count
  const finalColumns = await knex.raw(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'raindrop' 
    AND table_name = 'bookmarks'
    ORDER BY ordinal_position
  `);
  
  console.log('📋 Final raindrop.bookmarks schema:');
  finalColumns.rows.forEach(col => {
    console.log(`   ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
  });
  
  console.log('🎉 raindrop.bookmarks schema update completed!');
};

exports.down = async function(knex) {
  console.log('⚠️  Rolling back raindrop.bookmarks column additions...');
  
  // Check if table exists
  const tableExists = await knex.schema.withSchema('raindrop').hasTable('bookmarks');
  
  if (!tableExists) {
    console.log('ℹ️  raindrop.bookmarks table does not exist, nothing to rollback');
    return;
  }
  
  // Remove added columns
  await knex.schema.withSchema('raindrop').alterTable('bookmarks', table => {
    table.dropColumn('description');
    table.dropColumn('is_organized');
  });
  
  console.log('🗑️  Removed description and is_organized columns from raindrop.bookmarks');
}; 