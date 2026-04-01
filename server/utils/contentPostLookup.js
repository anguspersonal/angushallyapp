/**
 * Load a post by numeric id or slug string.
 * @param {{ getPostById: Function, getPostBySlug: Function }} contentService
 * @param {string} identifier — route param (digits => id, else slug)
 */
async function getPostByRouteIdentifier(contentService, identifier) {
  const isNumericId = /^\d+$/.test(identifier);
  return isNumericId
    ? contentService.getPostById(Number(identifier))
    : contentService.getPostBySlug(identifier);
}

module.exports = { getPostByRouteIdentifier };
