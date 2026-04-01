const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { analyzeText: analyzeTextService } = require('../ai-api/apiService');
const { validateAnalyseTextPayload, MAX_PAYLOAD_BYTES } = require('../utils/analyseTextValidation');
const { createAnalysisLimiter } = require('./analyseText/createAnalysisLimiter');

module.exports = function createAnalyseTextRoute(deps = {}) {
  const router = express.Router();
  const { logger, analyzeText = analyzeTextService } = deps;

  router.use(authMiddleware());
  router.use(createAnalysisLimiter(logger));
  router.use(
    express.json({
      limit: `${MAX_PAYLOAD_BYTES}b`,
      strict: true,
    })
  );

  router.use((err, req, res, next) => {
    if (!err) return next();

    const scopedLogger = req.logger || logger;
    const correlationId = req.context?.correlationId;

    if (err.type === 'entity.too.large') {
      scopedLogger?.warn?.('analyseText.payload_too_large', {
        correlationId,
        userId: req.user?.id,
        payloadBytes: Number(req.get('content-length')),
      });
      return res.status(413).json({ error: 'Payload too large' });
    }

    if (err instanceof SyntaxError) {
      scopedLogger?.warn?.('analyseText.invalid_payload', {
        correlationId,
        userId: req.user?.id,
        reason: 'invalid-json',
      });
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    return next(err);
  });

  router.post('/analyze', async (req, res) => {
    const startTime = Date.now();
    const scopedLogger = req.logger || logger;
    const correlationId = req.context?.correlationId;
    const contentLengthHeader = Number(req.get('content-length'));
    const bodyBytes = Number.isFinite(contentLengthHeader)
      ? contentLengthHeader
      : Buffer.byteLength(JSON.stringify(req.body || {}), 'utf8');

    scopedLogger?.info?.('analyseText.request.received', {
      correlationId,
      userId: req.user?.id,
      payloadBytes: bodyBytes,
    });

    try {
      if (bodyBytes > MAX_PAYLOAD_BYTES) {
        scopedLogger?.warn?.('analyseText.payload_too_large', {
          correlationId,
          userId: req.user?.id,
          payloadBytes: bodyBytes,
        });
        return res.status(413).json({ error: 'Payload too large' });
      }

      const { text } = req.body || {};
      const validation = validateAnalyseTextPayload(text);
      if (!validation.ok) {
        scopedLogger?.warn?.('analyseText.invalid_payload', {
          correlationId,
          userId: req.user?.id,
          reason: validation.reason,
          ...(validation.length !== undefined && { length: validation.length }),
          ...(validation.payloadBytes !== undefined && { payloadBytes: validation.payloadBytes }),
        });
        return res.status(validation.status).json({ error: validation.error });
      }

      const { trimmedText } = validation;

      const analysis = await analyzeText(trimmedText);

      scopedLogger?.info?.('analyseText.request.completed', {
        correlationId,
        userId: req.user?.id,
        durationMs: Date.now() - startTime,
      });

      return res.json({ analysis });
    } catch (error) {
      scopedLogger?.error?.('analyseText.request.failed', {
        correlationId,
        userId: req.user?.id,
        durationMs: Date.now() - startTime,
        error,
      });
      return res.status(500).json({ error: 'Failed to analyze text' });
    }
  });

  return router;
};
