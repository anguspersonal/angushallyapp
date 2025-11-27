const { createContactLimiter } = require('./middleware');

function isExpressRouter(route) {
  return (
    typeof route === 'function' &&
    typeof route.use === 'function' &&
    Array.isArray(route.stack)
  );
}

function loadRoute(modulePath, deps) {
  // Supports both plain routers and factory functions for DI
  const loaded = require(modulePath);
  const route = loaded && loaded.default ? loaded.default : loaded;

  if (isExpressRouter(route)) {
    return route;
  }

  return typeof route === 'function' ? route(deps) : route;
}

function registerRoutes(app, deps = {}) {
  const contactLimiter = createContactLimiter();

  const contactRoute = loadRoute('../routes/contact', deps);
  const dbRoute = loadRoute('../routes/dbRoute', deps);
  const contentRoute = loadRoute('../routes/contentRoute', deps);
  const hygieneScoreRoute = loadRoute('../routes/hygieneScoreRoute', deps);
  const stravaRoute = loadRoute('../routes/stravaRoute', deps);
  const habitRoute = loadRoute('../routes/habitRoute', deps);
  const authRoute = loadRoute('../routes/authRoute', deps);
  const analyseTextRoute = loadRoute('../routes/analyseTextRoute', deps);
  const raindropRoute = loadRoute('../routes/raindropRoute', deps);
  const raindropCallbackRoute = loadRoute('../routes/raindropCallback', deps);
  const bookmarkRoute = loadRoute('../routes/bookmarkRoute', deps);
  const f5CertaintyRoute = loadRoute('../routes/f5CertaintyRoute', deps);
  const instagramIntelligenceRoute = loadRoute('../routes/instagramIntelligenceRoute', deps);

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
