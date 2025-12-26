const { randomUUID } = require('crypto');

function getCorrelationIdFromHeaders(headers = {}) {
  const traceHeader = headers['x-trace-id'] || headers['x-correlation-id'];
  return Array.isArray(traceHeader) ? traceHeader[0] : traceHeader;
}

function createBackgroundContext(source = 'background') {
  return { correlationId: randomUUID(), source };
}

function createRequestContext(req = {}) {
  const correlationId =
    req.context?.correlationId || getCorrelationIdFromHeaders(req.headers || {}) || req.requestId || randomUUID();
  const userId = req.user?.id || null;

  return {
    correlationId,
    userId,
    path: req.path,
    method: req.method,
  };
}

function applyRequestContext(logger) {
  return (req, _res, next) => {
    const context = createRequestContext(req);
    req.context = context;
    req.requestId = context.correlationId;

    req.logger = logger?.createRequestContextLogger
      ? logger.createRequestContextLogger(context.correlationId, {
          path: req.path,
          method: req.method,
          userId: context.userId,
        })
      : logger;

    next();
  };
}

module.exports = {
  createBackgroundContext,
  createRequestContext,
  applyRequestContext,
  getCorrelationIdFromHeaders,
};
