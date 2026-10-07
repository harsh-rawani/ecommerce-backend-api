import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Production E-Commerce REST API',
      version: '1.0.0',
      description:
        'Scalable, secure, production-grade E-Commerce backend API built with Node.js, Express, and MongoDB.',
      contact: {
        name: 'Harsh Rawani',
        email: 'developer@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}${config.API_PREFIX}`,
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token (e.g. Bearer eyJhbGci...)'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Resource not found' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'RESOURCE_NOT_FOUND' },
                details: { type: 'array', items: { type: 'object' } }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // Scans all route files for JSDoc documentation
};

export const swaggerSpec = swaggerJsdoc(options);