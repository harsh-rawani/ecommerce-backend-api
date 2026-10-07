import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express'; // <-- Added

import { config } from './config/env.js';
import { swaggerSpec } from './config/swagger.js'; // <-- Added
import { requestIdMiddleware } from './middlewares/requestId.middleware.js';
import { httpLogger } from './middlewares/httpLogger.middleware.js';
import { notFoundMiddleware } from './middlewares/notFound.middleware.js';
import { errorHandler } from './errors/errorHandler.js';
import { globalLimiter, authLimiter } from './middlewares/rateLimiter.middleware.js';
import rootRouter from './routes/index.js';

const app = express();

// 1. Edge Request Tracing & Structured Logging
app.use(requestIdMiddleware);
app.use(httpLogger);

// 2. Security Headers (Relax CSP specifically for Swagger UI inline assets)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    }
  })
);
app.use(compression());

// 3. CORS Configuration
app.use(
  cors({
    origin: config.CORS_ORIGIN === '*' ? '*' : config.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
  })
);

// 4. Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 5. Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// 6. Interactive API Documentation (Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 7. Rate Limiting
app.use(config.API_PREFIX, globalLimiter);
app.use(`${config.API_PREFIX}/auth/login`, authLimiter);
app.use(`${config.API_PREFIX}/auth/register`, authLimiter);

// 8. Core Application Routes
app.use(config.API_PREFIX, rootRouter);

// 9. 404 & Centralized Error Boundary
app.use(notFoundMiddleware);
app.use(errorHandler);

export default app;