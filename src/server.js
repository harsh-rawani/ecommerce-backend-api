import app from './app.js';
import { config } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './lib/logger.js';

let server;

const startServer = async () => {
  await connectDatabase();

  server = app.listen(config.PORT, () => {
    logger.info(`[SERVER] Application running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    logger.info(`[SERVER] Health check: ${config.API_PREFIX}/health`);
    logger.info(`[SERVER] Readiness check: ${config.API_PREFIX}/health/ready`);
  });
};

const shutdown = async (signal) => {
  logger.warn(`[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async (err) => {
      if (err) {
        logger.error({ err }, '[SHUTDOWN] Error closing HTTP server');
        process.exit(1);
      }
      logger.info('[SHUTDOWN] HTTP server closed.');

      await disconnectDatabase();

      logger.info('[SHUTDOWN] Clean exit completed.');
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }

  setTimeout(() => {
    logger.fatal('[SHUTDOWN] Graceful shutdown timeout (10s) reached. Forcing exit.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, '[CRITICAL] Unhandled Promise Rejection');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, '[CRITICAL] Uncaught Exception thrown');
  process.exit(1);
});

startServer();