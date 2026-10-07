import { config } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';
import { ErrorCode } from '../constants/errorCodes.js';
import { logger } from '../lib/logger.js';

export const errorHandler = (err, req, res, _next) => {
  const isOperational = err.isOperational || false;
  const statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  const errorCode = err.errorCode || ErrorCode.INTERNAL_ERROR;
  const message = isOperational ? err.message : 'An unexpected internal error occurred';
  const details = err.details || null;

  // Log error with correlation metadata
  logger.error({
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    errorCode,
    isOperational,
    message: err.message,
    stack: err.stack
  });

  const errorPayload = {
    code: errorCode,
    ...(details && { details }),
    ...(config.NODE_ENV === 'development' && {
      stack: err.stack,
      rawError: err.message
    })
  };

  return ApiResponse.error(res, statusCode, message, errorPayload.code, errorPayload.details || undefined);
};