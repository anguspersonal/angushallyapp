const { createContactLimiter } = require('./middleware');
const { createContentService } = require('../services/contentService');
const { createHabitService } = require('../services/habitService');
const db = require('../db');

function isExpressRouter(route) {
  return (
    typeof route === 'function' &&
    typeof route.use === 'function' &&
    typeof route.handle === 'function' &&
    Array.isArray(route.stack)
  );
}

function isMiddleware(route) {
  return typeof route === 'function' && route.length >= 2;
}

function loadRoute(modulePath, deps) {
  // Supports both plain routers and factory functions for DI
  const loaded = require(modulePath);
  const route = loaded && loaded.default ? loaded.default : loaded;

  if (isExpressRouter(route) || isMiddleware(route)) {
    return route;
  }

  return typeof route === 'function' ? route(deps) : route;
}

function registerRoutes(app, deps = {}) {
  const contactLimiter = createContactLimiter();
  const habitApi = deps.habitApi || require('../habit-api/habitService');
  const alcoholService = deps.alcoholService || require('../habit-api/alcoholService');
  const exerciseService = deps.exerciseService || require('../habit-api/exerciseService');
  const aggregateService = deps.aggregateService || require('../habit-api/aggregateService');
  const contentService = deps.contentService || createContentService({ db: deps.db || db, logger: deps.logger });
  const habitService =
    deps.habitService ||
    createHabitService({ habitApi, aggregateService, alcoholService, exerciseService, logger: deps.logger });

  const sharedDeps = {
    ...deps,
    contentService,
    habitService,
    habitApi,
    alcoholService,
    exerciseService,
    aggregateService,
  };

  const contactRoute = loadRoute('../routes/contact', sharedDeps);
  const dbRoute = loadRoute('../routes/dbRoute', sharedDeps);
  const contentRoute = loadRoute('../routes/contentRoute', sharedDeps);
  const hygieneScoreRoute = loadRoute('../routes/hygieneScoreRoute', sharedDeps);
  const stravaRoute = loadRoute('../routes/stravaRoute', sharedDeps);
  const habitRoute = loadRoute('../routes/habitRoute', sharedDeps);
  const authRoute = loadRoute('../routes/authRoute', sharedDeps);
  const analyseTextRoute = loadRoute('../routes/analyseTextRoute', sharedDeps);
  const raindropRoute = loadRoute('../routes/raindropRoute', sharedDeps);
  const raindropCallbackRoute = loadRoute('../routes/raindropCallback', sharedDeps);
  const bookmarkRoute = loadRoute('../routes/bookmarkRoute', sharedDeps);
  const f5CertaintyRoute = loadRoute('../routes/f5CertaintyRoute', sharedDeps);
  const instagramIntelligenceRoute = loadRoute('../routes/instagramIntelligenceRoute', sharedDeps);

  app.use('/api/contact', contactLimiter, contactRoute);
  app.use('/api/db', dbRoute);
  app.use('/api/content', contentRoute);
  app.use('/api/hygieneScoreRoute', hygieneScoreRoute);
  app.use('/api/strava', stravaRoute);
  app.use('/api/habit', habitRoute);
  app.use('/api/auth', authRoute);
  app.use('/api/analyseText', analyseTextRoute);
  app.use('/api/raindrop/oauth/callback', raindropCallbackRoute);
  app.use('/api/raindrop', raindropRoute);
  app.use('/api/bookmarks', bookmarkRoute);
  app.use('/api/f5', f5CertaintyRoute);
  app.use('/api/instagram-intelligence', instagramIntelligenceRoute);
  app.get('/api', function (_req, res) {
    res.set('Content-Type', 'application/json');
    res.send('{"message":"Hello from the custom server!"}');
  });
}

module.exports = { registerRoutes, loadRoute };
