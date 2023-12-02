export default () => ({
  appEnv: process.env.APP_ENV || 'dev',
  appHost: process.env.APP_HOST || 'http://localhost',
  appPort: parseInt(process.env.APP_PORT, 10) || 3000,
  dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  dbName: process.env.MONGO_DB,
  aiCortextUrl: process.env.AI_CORTEX_URL,
  aiCortextApiKey: process.env.AI_CORTEX_TOKEN,
});
