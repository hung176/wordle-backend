export default () => ({
  appEnv: process.env.APP_ENV || 'dev',
  appHost: process.env.APP_HOST || 'http://localhost',
  appPort: parseInt(process.env.APP_PORT, 10) || 3333,
  dbConnectionString: process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/wordle',
  // dbName: process.env.MONGO_DB || 'wordle',
  aiCortextUrl: process.env.AI_CORTEX_URL,
  aiCortextApiKey: process.env.AI_CORTEX_TOKEN,
  aiCohereUrl: process.env.AI_COHERE_URL,
  aiCohereApiKey: process.env.AI_COHERE_TOKEN,
});
