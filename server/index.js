/**
 * Legacy Express entrypoint — local dev, Jest, and Knex migration workflows only.
 * Production on Vercel runs the `web` app only (Next Route Handlers + Supabase); see docs/architecture.md.
 */
const { startServer } = require('./bootstrap/createServer');

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
