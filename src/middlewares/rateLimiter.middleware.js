import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';
import { ErrorCode } from '../constants/errorCodes.js';

const createRateLimitHandler = (message) => (_req, res) => {
  return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
    success: false,
    message,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED
    }
  });
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  skip: () => config.NODE_ENV === 'test', // Skip during automated test suites
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many requests from this IP, please try again after 15 minutes')
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => config.NODE_ENV === 'test', // Skip during automated test suites
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('Too many authentication attempts. Please try again after 15 minutes.')
});