const express = require('express');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('../middleware/auth');
const { analyzeText: analyzeTextService } = require('../ai-api/apiService');

const MAX_PAYLOAD_BYTES = 10 * 1024; // 10kb
const MAX_TEXT_LENGTH = 2000;

function createAnalysisLimiter(logger) {
  return rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id || req.ip,
    handler: (req, res) => {
      const scopedLogger = req.logger || logger;
      scopedLogger?.warn?.('analyseText.rate_limited', {
        correlationId: req.context?.correlationId,
        userId: req.user?.id,
        ip: req.ip,
      });

      res.status(429).json({ error: 'Too many analysis requests. Please slow down.' });
    },
  });
}

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
      if (typeof text !== 'string') {
        scopedLogger?.warn?.('analyseText.invalid_payload', { correlationId, userId: req.user?.id, reason: 'missing-text' });
        return res.status(400).json({ error: 'Text input is required' });
      }

      const trimmedText = text.trim();
      if (!trimmedText) {
        scopedLogger?.warn?.('analyseText.invalid_payload', { correlationId, userId: req.user?.id, reason: 'empty-text' });
        return res.status(400).json({ error: 'Text input cannot be empty' });
      }

      if (trimmedText.length > MAX_TEXT_LENGTH) {
        scopedLogger?.warn?.('analyseText.invalid_payload', {
          correlationId,
          userId: req.user?.id,
          reason: 'text-too-long',
          length: trimmedText.length,
        });
        return res.status(413).json({ error: `Text input exceeds ${MAX_TEXT_LENGTH} characters` });
      }

      const textBytes = Buffer.byteLength(trimmedText, 'utf8');
      if (textBytes > MAX_PAYLOAD_BYTES) {
        scopedLogger?.warn?.('analyseText.payload_too_large', {
          correlationId,
          userId: req.user?.id,
          payloadBytes: textBytes,
        });
        return res.status(413).json({ error: 'Text input is too large' });
      }

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
