import pino from 'pino';
import { config } from '../config/env.js';

export const logger = pino({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  // Redact sensitive credentials automatically
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.currentPassword',
      'body.newPassword',
      'body.refreshToken',
      'password',
      'refreshToken'
    ],
    censor: '[REDACTED]'
  },
  // Pretty formatting during development; raw ndjson in production
  transport:
    config.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
          }
        }
      : undefined
});