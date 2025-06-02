/* 

Bookmark Metadata Enricher is a tool for identifying and adding metadata to bookmarks from the database using their URLs.

Steps:
1. Get list of bookmarks from the database for a given user. Filter for those marked as 'not organised'.
2. For each bookmark, fetch metadata using the URL.
3. Update the bookmark with the fetched metadata.
4. Repeat for all bookmarks.

*/

const bookmarkService = require('./bookmarkService');
const { fetchMetadata } = require('./openGraph');

/**
 * Bookmark Metadata Enricher is a tool for identifying and adding metadata to bookmarks from the database using their URLs.
 * 
 * Steps:
 * 1. Get list of bookmarks from the database for a given user. Filter for those marked as 'not organised'.
 * 2. For each bookmark, fetch metadata using the URL.
 * 3. Update the bookmark with the fetched metadata.
 * 4. Repeat for all bookmarks.
 */

/**
 * Enriches bookmarks by fetching and updating their metadata
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Results of the enrichment process
 */
const enrichBookmarkMetadata = async (userId) => {
    try {
        // Get unorganised bookmarks
        const bookmarks = await bookmarkService.getUnorganisedBookmarks(userId);
        
        if (!bookmarks || bookmarks.length === 0) {
            // Log the empty sync
            await bookmarkService.logSync(
                userId,
                0,
                'success',
                null
            );

            return {
                processed: 0,
                success: 0,
                failed: 0,
                errors: []
            };
        }

        const results = {
            processed: bookmarks.length,
            success: 0,
            failed: 0,
            errors: []
        };

        // Process each bookmark
        for (const bookmark of bookmarks) {
            try {
                // Fetch metadata
                const metadata = await fetchMetadata(bookmark.url);

                // Update bookmark with metadata
                await bookmarkService.updateBookmarkMetadata(userId, bookmark.id, {
                    title: metadata.title,
                    description: metadata.description,
                    image: metadata.image,
                    site_name: metadata.site_name,
                    resolved_url: metadata.resolved_url,
                    is_organised: true
                });

                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    bookmarkId: bookmark.id,
                    url: bookmark.url,
                    error: error.message
                });
            }
        }

        // Log the sync
        await bookmarkService.logSync(
            userId,
            bookmarks.length,
            results.failed === 0 ? 'success' : 'partial_success',
            results.failed > 0 ? `${results.failed} bookmarks failed to process` : null
        );

        return results;
    } catch (error) {
        console.error('Error in bookmark metadata enrichment:', error);
        
        // Log the failed sync
        await bookmarkService.logSync(
            userId,
            0,
            'error',
            error.message
        );

        throw error;
    }
};

module.exports = enrichBookmarkMetadata; 