import { HttpStatus } from '../constants/httpStatusCodes.js';
import { ErrorCode } from '../constants/errorCodes.js';
import { AppError } from '../errors/AppError.js';
import { verifyAccessToken } from '../utils/token.util.js';
import { UserRepository } from '../repositories/user.repository.js';
import { User } from '../models/user.model.js';

export const requireAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Authentication required. Please provide a valid Bearer token.',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHENTICATED
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      throw new AppError(
        'Invalid or expired access token',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHENTICATED
      );
    }

    // Retrieve active user document
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new AppError(
        'The user belonging to this token no longer exists.',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHENTICATED
      );
    }

    if (user.status !== 'active') {
      throw new AppError(
        'Account is deactivated or suspended.',
        HttpStatus.FORBIDDEN,
        ErrorCode.UNAUTHORIZED
      );
    }

    // Invalidate token if password was changed after token issuance
    if (user.isPasswordChangedAfter(decoded.iat)) {
      throw new AppError(
        'Password recently changed. Please log in again.',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHENTICATED
      );
    }

    // Attach domain user context
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    return next(
      new AppError(
        'User context missing in authorization check',
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_ERROR
      )
    );
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(
      new AppError(
        'You do not have permission to perform this action',
        HttpStatus.FORBIDDEN,
        ErrorCode.UNAUTHORIZED
      )
    );
  }

  next();
}; 