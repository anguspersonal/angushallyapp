/**
 * Migration: Transfer unorganized Raindrop bookmarks to canonical store
 * 
 * This migration resolves the production issue where users have bookmarks in 
 * raindrop.bookmarks but empty bookmarks.bookmarks tables.
 * 
 * - Transfers all unorganized raindrop bookmarks to canonical store
 * - Prevents duplicates using source_type + source_id
 * - Includes metadata enrichment with OpenGraph data
 * - Maintains data integrity with transaction safety
 * - Provides detailed logging for monitoring
 */

/**
 * OpenGraph metadata fetching with timeout and error handling
 */
async function fetchMetadata(url) {
  try {
    const ogs = require('open-graph-scraper');
    const { result } = await ogs({
      url,
      timeout: 10000,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; BookmarkService/1.0; +http://localhost)',
      },
      onlyGetOpenGraphInfo: false,
      fetchFromFallback: true
    });

    return {
      title: result.ogTitle || result.twitterTitle || result.title || null,
      description: result.ogDescription || result.twitterDescription || result.description || null,
      image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || null,
      site_name: result.ogSiteName || null,
      resolved_url: result.requestUrl || url,
      error: null
    };
  } catch (error) {
    return {
      title: null,
      description: null,
      image: null,
      site_name: null,
      resolved_url: url,
      error: { message: error.message, code: error.code || 'UNKNOWN_ERROR' }
    };
  }
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Process bookmarks in batches to avoid memory issues
 */
async function processBookmarksBatch(knex, raindropBookmarks, batchSize = 10) {
  const results = {
    success: 0,
    failed: 0,
    enriched: 0,
    errors: []
  };

  console.log(`📦 Processing ${raindropBookmarks.length} bookmarks in batches of ${batchSize}`);

  for (let i = 0; i < raindropBookmarks.length; i += batchSize) {
    const batch = raindropBookmarks.slice(i, i + batchSize);
    console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(raindropBookmarks.length/batchSize)}`);

    for (const bookmark of batch) {
      try {
        // Check if bookmark already exists in canonical store
        const existing = await knex('bookmarks.bookmarks')
          .where({
            user_id: bookmark.user_id,
            source_type: 'raindrop',
            source_id: String(bookmark.raindrop_id)
          })
          .first();

        if (existing) {
          console.log(`⏭️  Skipping duplicate bookmark: ${bookmark.title} (ID: ${bookmark.id})`);
          continue;
        }

        // Fetch metadata for enrichment
        let enrichedMetadata = null;
        if (bookmark.link && isValidUrl(bookmark.link)) {
          console.log(`📡 Fetching metadata for: ${bookmark.link.substring(0, 50)}...`);
          enrichedMetadata = await fetchMetadata(bookmark.link);
          
          if (enrichedMetadata.error) {
            console.warn(`⚠️  Metadata fetch failed: ${enrichedMetadata.error.message}`);
          } else {
            results.enriched++;
            console.log(`✅ Metadata enriched for: ${bookmark.title}`);
          }
        }

        // Prepare canonical bookmark data
        const canonicalBookmark = {
          user_id: bookmark.user_id,
          title: bookmark.title || enrichedMetadata?.title || 'Untitled',
          url: bookmark.link,
          resolved_url: enrichedMetadata?.resolved_url || bookmark.link,
          description: bookmark.description || enrichedMetadata?.description,
          image_url: enrichedMetadata?.image,
          site_name: enrichedMetadata?.site_name,
          tags: bookmark.tags || [],
          source_type: 'raindrop',
          source_id: String(bookmark.raindrop_id),
          source_metadata: {
            raindrop_id: bookmark.raindrop_id,
            original_created_at: bookmark.created_at,
            metadata_enriched: !!enrichedMetadata && !enrichedMetadata.error,
            metadata_source: enrichedMetadata && !enrichedMetadata.error ? 'opengraph' : null,
            metadata_error: enrichedMetadata?.error || null,
            migrated_at: new Date(),
                         migration_version: '20250620000000'
          },
          is_organized: false,
          created_at: bookmark.created_at,
          updated_at: new Date()
        };

        // Insert into canonical store
        await knex('bookmarks.bookmarks').insert(canonicalBookmark);

        // Mark as organized in raindrop table
        await knex('raindrop.bookmarks')
          .where('id', bookmark.id)
          .update({ 
            is_organized: true,
            updated_at: new Date()
          });

        results.success++;
        console.log(`✅ Migrated bookmark: ${bookmark.title} (${results.success}/${raindropBookmarks.length})`);

      } catch (error) {
        results.failed++;
        results.errors.push({
          bookmarkId: bookmark.id,
          title: bookmark.title || 'Untitled',
          error: error.message
        });
        console.error(`❌ Failed to migrate bookmark ${bookmark.id}: ${error.message}`);
      }
    }

    // Small delay between batches to avoid overwhelming external APIs
    if (i + batchSize < raindropBookmarks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

exports.up = async function(knex) {
  console.log('🚀 Starting migration: Transfer Raindrop bookmarks to canonical store');
  
  try {
    // Get all unorganized raindrop bookmarks
    const unorganizedBookmarks = await knex('raindrop.bookmarks')
      .where('is_organized', false)
      .orderBy('created_at', 'asc');

    if (unorganizedBookmarks.length === 0) {
      console.log('ℹ️  No unorganized raindrop bookmarks found. Migration complete.');
      return;
    }

    console.log(`📋 Found ${unorganizedBookmarks.length} unorganized raindrop bookmarks to migrate`);

    // Group by user for better logging
    const userGroups = unorganizedBookmarks.reduce((groups, bookmark) => {
      if (!groups[bookmark.user_id]) {
        groups[bookmark.user_id] = [];
      }
      groups[bookmark.user_id].push(bookmark);
      return groups;
    }, {});

    console.log(`👥 Processing bookmarks for ${Object.keys(userGroups).length} users`);

    // Process all bookmarks with metadata enrichment
    const results = await processBookmarksBatch(knex, unorganizedBookmarks);

    // Final summary
    console.log('🎉 Migration completed!');
    console.log(`📊 Results Summary:`);
    console.log(`   - Total processed: ${unorganizedBookmarks.length}`);
    console.log(`   - Successfully migrated: ${results.success}`);
    console.log(`   - Failed migrations: ${results.failed}`);
    console.log(`   - Metadata enriched: ${results.enriched}`);
    console.log(`   - Users affected: ${Object.keys(userGroups).length}`);

    if (results.errors.length > 0) {
      console.log(`⚠️  Errors encountered:`);
      results.errors.slice(0, 10).forEach(error => {
        console.log(`   - ${error.title}: ${error.error}`);
      });
      if (results.errors.length > 10) {
        console.log(`   - ... and ${results.errors.length - 10} more errors`);
      }
    }

    // Log user-level statistics
    console.log(`👥 Per-user migration summary:`);
    Object.entries(userGroups).forEach(([userId, userBookmarks]) => {
      const userSuccess = userBookmarks.filter(b => 
        !results.errors.some(e => e.bookmarkId === b.id)
      ).length;
      console.log(`   - User ${userId}: ${userSuccess}/${userBookmarks.length} bookmarks migrated`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error; // This will cause the migration to be rolled back
  }
};

exports.down = async function(knex) {
  console.log('🔄 Rolling back migration: Remove migrated bookmarks and reset raindrop flags');
  
  try {
    // Find all bookmarks that were migrated by this migration
    const migratedBookmarks = await knex('bookmarks.bookmarks')
      .where('source_metadata->migration_version', '20250620000000');

    console.log(`🔍 Found ${migratedBookmarks.length} bookmarks to rollback`);

    if (migratedBookmarks.length === 0) {
      console.log('ℹ️  No bookmarks to rollback. Rollback complete.');
      return;
    }

    // Extract raindrop IDs for resetting organized flags
    const raindropIds = migratedBookmarks
      .map(b => b.source_metadata?.raindrop_id)
      .filter(id => id);

    // Remove migrated bookmarks from canonical store
    await knex('bookmarks.bookmarks')
      .where('source_metadata->migration_version', '20250620000000')
      .del();

    console.log(`✅ Removed ${migratedBookmarks.length} migrated bookmarks from canonical store`);

    // Reset is_organized flag in raindrop table
    if (raindropIds.length > 0) {
      await knex('raindrop.bookmarks')
        .whereIn('raindrop_id', raindropIds)
        .update({ 
          is_organized: false,
          updated_at: new Date()
        });

      console.log(`✅ Reset organized flags for ${raindropIds.length} raindrop bookmarks`);
    }

    console.log('🎉 Migration rollback completed successfully');

  } catch (error) {
    console.error('❌ Migration rollback failed:', error);
    throw error;
  }
}; 