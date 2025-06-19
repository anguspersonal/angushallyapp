/**
 * Migration to consolidate old bookmark.bookmarks into new bookmarks.bookmarks
 * - Migrates all data from bookmark.bookmarks to bookmarks.bookmarks
 * - Maps columns appropriately with data type conversions
 * - Handles tags conversion from jsonb to text[]
 * - Creates comprehensive source_metadata from old fields
 * - Drops old bookmark schema after successful migration
 */

exports.up = async function(knex) {
  console.log('🔄 Starting migration from bookmark.bookmarks to bookmarks.bookmarks...');
  
  // Check if old bookmark schema exists
  const bookmarkSchemaExists = await knex.raw(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.schemata 
      WHERE schema_name = 'bookmark'
    )
  `);
  
  if (!bookmarkSchemaExists.rows[0].exists) {
    console.log('ℹ️  Old bookmark schema does not exist, skipping migration');
    return;
  }
  
  // Check if old bookmarks table exists
  const oldTableExists = await knex.raw(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'bookmark' AND table_name = 'bookmarks'
    )
  `);
  
  if (!oldTableExists.rows[0].exists) {
    console.log('ℹ️  Old bookmark.bookmarks table does not exist, skipping migration');
    return;
  }
  
  // Get count of records to migrate
  const countResult = await knex.raw('SELECT COUNT(*) as count FROM bookmark.bookmarks');
  const recordCount = parseInt(countResult.rows[0].count);
  console.log(`📊 Found ${recordCount} records to migrate`);
  
  if (recordCount === 0) {
    console.log('ℹ️  No records to migrate');
  } else {
    // Migrate data in batches to handle large datasets
    const batchSize = 100;
    let offset = 0;
    let migratedCount = 0;
    
    while (offset < recordCount) {
      console.log(`📦 Processing batch ${Math.floor(offset/batchSize) + 1} (records ${offset + 1}-${Math.min(offset + batchSize, recordCount)})`);
      
      // Fetch batch of old records
      const oldRecords = await knex.raw(`
        SELECT 
          id,
          user_id,
          url,
          resolved_url,
          title,
          description,
          source,
          created_at,
          updated_at,
          is_organised,
          type,
          locale,
          image_alt,
          video_url,
          audio_url,
          published_time,
          author,
          section,
          metadata_source,
          raw_metadata,
          image_url,
          tags,
          site_name
        FROM bookmark.bookmarks 
        ORDER BY id 
        LIMIT ${batchSize} OFFSET ${offset}
      `);
      
      // Transform and insert records
      const transformedRecords = oldRecords.rows.map(record => {
        // Convert tags from jsonb to text array
        let tagsArray = [];
        if (record.tags) {
          try {
            const tagsJson = typeof record.tags === 'string' ? JSON.parse(record.tags) : record.tags;
            if (Array.isArray(tagsJson)) {
              tagsArray = tagsJson.filter(tag => tag && typeof tag === 'string');
            }
          } catch (error) {
            console.warn(`⚠️  Failed to parse tags for record ${record.id}:`, error.message);
          }
        }
        
        // Build source_metadata from various old fields
        const sourceMetadata = {
          original_id: record.id,
          migrated_from: 'bookmark.bookmarks',
          migration_date: new Date().toISOString()
        };
        
        // Add non-null metadata fields
        if (record.type) sourceMetadata.type = record.type;
        if (record.locale) sourceMetadata.locale = record.locale;
        if (record.video_url) sourceMetadata.video_url = record.video_url;
        if (record.audio_url) sourceMetadata.audio_url = record.audio_url;
        if (record.published_time) sourceMetadata.published_time = record.published_time;
        if (record.author) sourceMetadata.author = record.author;
        if (record.section) sourceMetadata.section = record.section;
        if (record.metadata_source) sourceMetadata.metadata_source = record.metadata_source;
        if (record.raw_metadata) sourceMetadata.raw_metadata = record.raw_metadata;
        
        return {
          id: knex.raw('gen_random_uuid()'), // Generate new UUID
          user_id: record.user_id,
          title: record.title || 'Untitled', // Handle null titles
          url: record.url,
          resolved_url: record.resolved_url,
          description: record.description,
          image_url: record.image_url,
          image_alt: record.image_alt,
          site_name: record.site_name,
          tags: tagsArray,
          source_type: record.source || 'manual', // Map old 'source' to 'source_type'
          source_id: `migrated_${record.id}`, // Use old ID as source_id with prefix
          source_metadata: sourceMetadata,
          is_organized: record.is_organised || false, // Map British to American spelling
          created_at: record.created_at || knex.fn.now(),
          updated_at: record.updated_at || knex.fn.now()
        };
      });
      
      // Insert transformed records
      if (transformedRecords.length > 0) {
        await knex('bookmarks.bookmarks').insert(transformedRecords);
        migratedCount += transformedRecords.length;
        console.log(`✅ Migrated ${transformedRecords.length} records (total: ${migratedCount}/${recordCount})`);
      }
      
      offset += batchSize;
    }
    
    console.log(`🎉 Successfully migrated ${migratedCount} records to bookmarks.bookmarks`);
  }
  
  // Verify migration success
  const newCountResult = await knex.raw('SELECT COUNT(*) as count FROM bookmarks.bookmarks WHERE source_metadata->>\'migrated_from\' = \'bookmark.bookmarks\'');
  const newCount = parseInt(newCountResult.rows[0].count);
  console.log(`📊 Verification: ${newCount} migrated records found in bookmarks.bookmarks`);
  
  if (newCount !== recordCount) {
    throw new Error(`Migration verification failed: Expected ${recordCount} records, found ${newCount}`);
  }
  
  // Drop old bookmark schema and tables
  console.log('🗑️  Dropping old bookmark schema and tables...');
  
  // Drop tables in correct order (foreign key dependencies)
  await knex.raw('DROP TABLE IF EXISTS bookmark.bookmark_sync_logs CASCADE');
  await knex.raw('DROP TABLE IF EXISTS bookmark.bookmarks CASCADE');
  
  // Drop schema if empty
  const remainingTablesResult = await knex.raw(`
    SELECT COUNT(*) as count 
    FROM information_schema.tables 
    WHERE table_schema = 'bookmark'
  `);
  
  if (parseInt(remainingTablesResult.rows[0].count) === 0) {
    await knex.raw('DROP SCHEMA IF EXISTS bookmark CASCADE');
    console.log('✅ Dropped old bookmark schema');
  } else {
    console.log('⚠️  Old bookmark schema not dropped - still contains tables');
  }
  
  console.log('🎉 Migration completed successfully!');
};

exports.down = function(knex) {
  // Note: This rollback is destructive and should be used with caution
  console.log('⚠️  Rolling back bookmark migration...');
  console.log('⚠️  WARNING: This will delete migrated data from bookmarks.bookmarks');
  console.log('⚠️  The original bookmark.bookmarks table cannot be restored');
  
  // Remove migrated records from bookmarks.bookmarks
  return knex('bookmarks.bookmarks')
    .where('source_metadata', 'like', '%migrated_from%')
    .del()
    .then(deletedCount => {
      console.log(`🗑️  Removed ${deletedCount} migrated records from bookmarks.bookmarks`);
      console.log('⚠️  NOTE: Original bookmark.bookmarks table was not restored');
    });
}; 