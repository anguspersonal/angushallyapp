const rateLimit = require('express-rate-limit');

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

module.exports = { createAnalysisLimiter };
