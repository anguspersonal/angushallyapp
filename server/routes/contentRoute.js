const express = require('express');
const { mapErrorToResponse, classifyError } = require('../observability/errors');

/**
 * Factory for content routes. Expects a contentService dependency that exposes
 * listPosts and getPostBySlug/getPostById.
 */
module.exports = function createContentRoutes({ contentService, logger }) {
  if (!contentService) {
    throw new Error('createContentRoutes requires a contentService dependency');
  }

  const router = express.Router();

  function logError(event, error, classification, req) {
    const scopedLogger = req.logger || logger;
    const level = classification?.type === 'validation' ? 'warn' : 'error';
    scopedLogger?.[level]?.(event, {
      error,
      correlationId: req.context?.correlationId,
      error_class: classification?.errorClass,
      is_recoverable: classification?.isRecoverable,
      is_user_facing: classification?.isUserFacing,
    });
  }

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
      const response = mapErrorToResponse(error, { defaultMessage: 'Failed to list posts' });
      logError('contentRoute.posts.failed', error, response.classification, req);
      return res.status(response.status).json(response.body);
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
        return res.status(404).json({ error: 'Post not found', code: 'CONTENT_NOT_FOUND' });
      }

      return res.json(post);
    } catch (error) {
      const classification = classifyError({ ...error, code: error?.code || 'CONTENT_FETCH_FAILED' });
      logError('contentRoute.postDetail.failed', error, classification, req);
      const defaultMessage = classification.code === 'CONTENT_NOT_FOUND' ? 'Post not found' : 'Failed to load post';
      const response = mapErrorToResponse({ code: classification.code }, { defaultMessage });
      return res.status(response.status).json(response.body);
    }
  });

  return router;
};
