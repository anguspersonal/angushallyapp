const { startServer } = require('./bootstrap/createServer');

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
