const { validateConfig } = require('./index');

try {
  const config = validateConfig();
  console.log('Configuration validated successfully:', {
    nodeEnv: config.nodeEnv,
    port: config.server.port,
    loadedEnvFiles: config.loadedEnvFiles,
  });
  process.exit(0);
} catch (error) {
  console.error('Configuration validation failed:', error.message);
  process.exit(1);
}
