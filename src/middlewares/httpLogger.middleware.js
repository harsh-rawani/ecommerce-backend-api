import pinoHttp from 'pino-http';
import { logger } from '../lib/logger.js';

export const httpLogger = pinoHttp({
  logger,
  // Bind the incoming requestId directly to the Pino child logger
  genReqId: (req) => req.id || req.headers['x-request-id'],
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} completed with ${res.statusCode}`,
  customErrorMessage: (req, res, err) => `${req.method} ${req.url} failed with ${res.statusCode}: ${err.message}`
});