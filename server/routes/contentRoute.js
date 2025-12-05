const express = require('express');

/**
 * Factory for content routes. Expects a contentService dependency that exposes
 * listPosts and getPostBySlug/getPostById.
 */
module.exports = function createContentRoutes({ contentService, logger = console }) {
  if (!contentService) {
    throw new Error('createContentRoutes requires a contentService dependency');
  }

  const router = express.Router();

  router.get('/posts', async (req, res, next) => {
    try {
      const params = {
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        sortBy: req.query.sortBy,
        order: req.query.order,
      };
      const result = await contentService.listPosts(params);
      res.json(result);
    } catch (error) {
      logger.error('Error in GET /api/content/posts', error);
      next(error);
    }
  });

  router.get('/posts/:identifier', async (req, res, next) => {
    try {
      const { identifier } = req.params;
      const isNumericId = /^\d+$/.test(identifier);
      const post = isNumericId
        ? await contentService.getPostById(Number(identifier))
        : await contentService.getPostBySlug(identifier);

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      return res.json(post);
    } catch (error) {
      logger.error('Error in GET /api/content/posts/:identifier', error);
      next(error);
    }
  });

  return router;
};
