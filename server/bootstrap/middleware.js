const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const express = require('express');

function requestLogger() {
  return (req, _res, next) => {
    req.requestId = req.headers['x-trace-id'];
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

function configureMiddleware(app, { config }) {
  app.use(requestLogger());
  app.use(securityHeaders(config.cors));
  app.use(express.json());
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
};
