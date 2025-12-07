const { randomUUID } = require('crypto');

function serializeError(error) {
  if (!error) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status,
      type: error.type,
    };
  }
  if (typeof error === 'object') {
    return { ...error };
  }
  return { message: String(error) };
}

function createLogger({ service = 'api', environment = process.env.NODE_ENV || 'development', defaultMeta = {}, sink = console } = {}) {
  const base = { service, environment, ...defaultMeta };

  function log(level, message, meta = {}) {
    const error = serializeError(meta.error);
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...base,
      ...meta,
      ...(error ? { error } : {}),
    };

    try {
      const serialized = JSON.stringify(entry);
      if (typeof sink[level] === 'function') {
        sink[level](serialized);
      } else {
        sink.log(serialized);
      }
    } catch (_err) {
      sink.error?.('failed to serialize log entry', _err);
    }
  }

  function child(context = {}) {
    return createLogger({ service, environment, defaultMeta: { ...base, ...context }, sink });
  }

  return {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
    child,
    createRequestContextLogger(correlationId, meta = {}) {
      const resolvedCorrelationId = correlationId || randomUUID();
      return child({ correlationId: resolvedCorrelationId, ...meta });
    },
  };
}

module.exports = { createLogger, serializeError };
