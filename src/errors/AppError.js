import { HttpStatus } from '../constants/httpStatusCodes.js';
import { ErrorCode } from '../constants/errorCodes.js';

export class AppError extends Error {
  constructor(
    message,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode = ErrorCode.INTERNAL_ERROR,
    details = null,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}