const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const express = require('express');
const { applyRequestContext } = require('../observability/requestContext');

function requestLogger(logger) {
  return (req, res, next) => {
    const scopedLogger = req.logger || logger;
    const startedAt = Date.now();

    scopedLogger?.info?.('request:received', {
      correlationId: req.context?.correlationId,
      path: req.path,
      method: req.method,
    });

    res.on('finish', () => {
      scopedLogger?.info?.('request:completed', {
        correlationId: req.context?.correlationId,
        path: req.path,
        method: req.method,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });

    next();
  };
}

function securityHeaders(cors) {
  return (req, res, next) => {
    const origin = req.headers.origin;
    if (cors.allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', cors.allowedMethods.join(', '));
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.header('Cross-Origin-Resource-Policy', 'same-site');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('X-XSS-Protection', '1; mode=block');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  };
}

function forceHttpsForOauth() {
  return (req, _res, next) => {
    if (req.get('X-Forwarded-Proto') === 'https' || req.get('X-Forwarded-Ssl') === 'on') {
      req.connection.encrypted = true;
    }
    next();
  };
}

function createGlobalLimiter() {
  return rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: {
      error: 'Too many requests, please try again later.',
    },
  });
}

function createContactLimiter() {
  return rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
      error: 'Too many contact form submissions, please try again later.',
    },
  });
}

function createAuthLimiter() {
  return rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many attempts, try again later.',
    },
  });
}

function configureMiddleware(app, { config, logger }) {
  const attachRequestContext = applyRequestContext(logger);
  app.use(attachRequestContext);
  app.use(requestLogger(logger));
  app.use(securityHeaders(config.cors));

  const globalJsonParser = express.json();
  const shouldBypassGlobalJson = (req) => req.originalUrl?.startsWith('/api/analyseText');

  app.use((req, res, next) => {
    if (shouldBypassGlobalJson(req)) {
      return next();
    }

    return globalJsonParser(req, res, next);
  });
  app.use(cookieParser());
  app.set('trust proxy', 1);

  if (config.nodeEnv === 'production') {
    app.use(forceHttpsForOauth());
  }

  app.use(createGlobalLimiter());
}

module.exports = {
  configureMiddleware,
  createContactLimiter,
  createAuthLimiter,
};
