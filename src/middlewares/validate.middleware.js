import { HttpStatus } from '../constants/httpStatusCodes.js';
import { ErrorCode } from '../constants/errorCodes.js';
import { AppError } from '../errors/AppError.js';

/**
 * Higher-order middleware to validate incoming request segments
 * @param {Object} schemas - Object containing optional body, query, or params Zod schemas
 */
export const validate = (schemas) => async (req, _res, next) => {
  try {
    if (schemas.body) {
      req.body = await schemas.body.parseAsync(req.body);
    }
    if (schemas.query) {
      req.query = await schemas.query.parseAsync(req.query);
    }
    if (schemas.params) {
      req.params = await schemas.params.parseAsync(req.params);
    }
    next();
  } catch (error) {
    // Format Zod issues into structured field-level errors
    const formattedErrors = error.errors?.map((err) => ({
      field: err.path.join('.'),
      message: err.message
    })) || [{ message: error.message }];

    next(
      new AppError(
        'Validation failed for incoming request data',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        formattedErrors
      )
    );
  }
};