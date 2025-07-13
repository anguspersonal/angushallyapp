const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const config = require('../config/env.js');
const db = require('./db'); // Import the database module
const rateLimit = require("express-rate-limit");
const { authMiddleware } = require('./middleware/auth.js');

const isDev = config.nodeEnv !== 'production';
// Use the validated web server port from the config
const PORT = config.ports.webServer;
// console.log('Server will start on port:', PORT);
// console.log(process.env.NODE_ENV,process.env.PORT);

// console.log('TEST_VAR:', process.env.TEST_VAR);

// console log node_env, JWT_secret, googleclientid and googleclientsecret
// console.log('node_env:', process.env.NODE_ENV);
// console.log('JWT_secret:', process.env.JWT_SECRET);
// console.log('googleclientid:', process.env.GOOGLE_CLIENT_ID);
// console.log('googleclientsecret:', process.env.GOOGLE_CLIENT_SECRET);

const app = express();

// Add request logging middleware
app.use((req, res, next) => {
  // console.log('Incoming request:', {
  //   method: req.method,
  //   path: req.path,
  //   query: req.query,
  //   headers: req.headers
  // });
  next();
});

// Security headers
app.use((req, res, next) => {
  // CORS headers
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://angushally.com'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Security headers
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.header('Cross-Origin-Resource-Policy', 'same-site');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('X-XSS-Protection', '1; mode=block');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Use body-parsing middleware
app.use(express.json());

// Use cookie-parser middleware
app.use(cookieParser());

// Trust proxy for express rate limit to work correctly
app.set("trust proxy", 1);

// Force HTTPS detection for OAuth redirects in production
if (config.nodeEnv === 'production') {
  app.use((req, res, next) => {
    // Force HTTPS protocol detection for OAuth libraries
    if (req.get('X-Forwarded-Proto') === 'https' || req.get('X-Forwarded-Ssl') === 'on') {
      req.connection.encrypted = true;
    }
    next();
  });
}

// ✅ Apply rate limiting BEFORE defining API routes
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: {
    error: "Too many requests, please try again later.",
  },
});

app.use(globalLimiter); // 👈 Applied early before API routes

// 🟢 Stricter limit for the contact form
const contactLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Only 10 requests per minute per IP
  message: {
    error: "Too many contact form submissions, please try again later.",
  },
});

// Apply the stricter limit to the contact form
const contactRoute = require('./routes/contact');
// console.log("Contact route registered at /api/contact");
app.use('/api/contact', contactLimiter, contactRoute); // 👈 Applied only to contact route

// ✅ Single DB query route
const dbRoute = require('./routes/dbRoute'); // Import the database route
app.use('/api/db', dbRoute); // Mount the route

// ✅ Content API routes (new)
const contentRoute = require('./routes/contentRoute');
app.use('/api/content', contentRoute);

// ✅ Hygiene score route
const hygieneScoreRoute = require('./routes/hygieneScoreRoute');
app.use('/api/hygieneScoreRoute',hygieneScoreRoute);

// ✅ Strava API routes
const stravaRoute = require('./routes/stravaRoute');
app.use('/api/strava',stravaRoute);

// ✅ Habit API routes
const habitRoute = require('./routes/habitRoute');
app.use('/api/habit', habitRoute);

// ✅ Auth API routes
const authRoute = require('./routes/authRoute');
app.use('/api/auth', authRoute);

// ✅ AI API routes
const analyseTextRoute  = require('./routes/analyseTextRoute');
app.use('/api/analyseText', analyseTextRoute);

// ✅ Raindrop API routes
const raindropRoute = require('./routes/raindropRoute');
const raindropCallbackRoute = require('./routes/raindropCallback');

// Mount the callback route (no auth needed)
app.use('/api/raindrop/oauth/callback', raindropCallbackRoute);

// Mount raindrop routes (auth applied selectively within the route file)
app.use('/api/raindrop', raindropRoute);

// ✅ Bookmark API routes (canonical bookmarks)
const bookmarkRoute = require('./routes/bookmarkRoute');
app.use('/api/bookmarks', bookmarkRoute);

// ✅ F5 Certainty Scoring Framework routes
const f5CertaintyRoute = require('./routes/f5CertaintyRoute');
app.use('/api/f5', f5CertaintyRoute);

// ✅ Instagram Intelligence routes
const instagramIntelligenceRoute = require('./routes/instagramIntelligenceRoute');
app.use('/api/instagram-intelligence', instagramIntelligenceRoute);

// ✅ Temporary health check route for Next.js hydration
app.get('/api/health', (req, res) => {
  res.json({ status: 'backend-ok', time: new Date().toISOString() });
});

// Bookmark routes removed - not used by frontend (uses raindrop routes instead)

// Route swapping to Next.js pages (enable via environment variables)
if (process.env.ENABLE_NEXT_LOGIN === 'true') {
  app.get('/login', (req, res) => res.redirect('/next/login'));
}
if (process.env.ENABLE_NEXT_ABOUT === 'true') {
  app.get('/about', (req, res) => res.redirect('/next/about'));
}
if (process.env.ENABLE_NEXT_PROJECTS === 'true') {
  app.get('/projects', (req, res) => res.redirect('/next/projects'));
}
if (process.env.ENABLE_NEXT_BLOG === 'true') {
  app.get('/blog', (req, res) => res.redirect('/next/blog'));
}
if (process.env.ENABLE_NEXT_CONTACT === 'true') {
  app.get('/contact', (req, res) => res.redirect('/next/contact'));
}
if (process.env.ENABLE_NEXT_CV === 'true') {
  app.get('/cv', (req, res) => res.redirect('/next/cv'));
}
if (process.env.ENABLE_NEXT_COLLAB === 'true') {
  app.get('/collab', (req, res) => res.redirect('/next/collab'));
}

// SEO redirects for migrated routes (fallback)
app.get('/about', function (req, res) {
  res.redirect(301, '/next/about/');
});

// Answer all other API requests.
app.get('/api', function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send('{"message":"Hello from the custom server!"}');
});

// All remaining requests should be handled by Next.js
// This fallback ensures any unmatched routes are handled gracefully
app.get('*', function (request, response) {
  if (isDev) {
    // In development, proxy to Next.js dev server
    const { createProxyMiddleware } = require('http-proxy-middleware');
    const proxy = createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
      logLevel: 'debug',
    });
    return proxy(request, response, () => {
      response.status(404).json({ error: 'Route not found' });
    });
  } else {
    // In production, serve Next.js static index.html for all unmatched routes
    const nextUiPath = path.resolve(__dirname, '../next-ui/out');
    if (fs.existsSync(nextUiPath)) {
      response.sendFile(path.resolve(nextUiPath, 'index.html'), (err) => {
        if (err) {
          response.status(404).json({ error: 'Route not found' });
        }
      });
    } else {
      response.status(404).json({ error: 'Application not built' });
    }
  }
});

// Override addEventListener to enforce passive listeners
(function() {
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === "touchstart" || type === "wheel") {
      options = options instanceof Object ? { ...options, passive: true } : { passive: true };
    }
    originalAddEventListener.call(this, type, listener, options);
  };
})();


app.listen(PORT, function () {
  // console.error(`Node ${isDev ? 'dev server' : 'cluster worker ' + process.pid}: listening on port ${PORT}`);
});
