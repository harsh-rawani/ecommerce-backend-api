import { AppError } from '../errors/AppError.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';
import { ErrorCode } from '../constants/errorCodes.js';

export const notFoundMiddleware = (req, _res, next) => {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      HttpStatus.NOT_FOUND,
      ErrorCode.ROUTE_NOT_FOUND
    )
  );
};