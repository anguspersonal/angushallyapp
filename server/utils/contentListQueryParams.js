/**
 * Parse query object from GET /api/content/posts into list params for contentService.
 * @param {Record<string, unknown>} query — typically req.query
 * @returns {{ page?: number, pageSize?: number, sortBy?: string, order?: string }}
 */
function parseContentListQueryParams(query) {
  return {
    page: query.page ? Number(query.page) : undefined,
    pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    sortBy: query.sortBy,
    order: query.order,
  };
}

module.exports = { parseContentListQueryParams };
