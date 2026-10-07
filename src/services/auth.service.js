import { UserRepository } from '../repositories/user.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { AppError } from '../errors/AppError.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';
import { ErrorCode } from '../constants/errorCodes.js';
import { UserRole } from '../constants/roles.js';
import {
  generateTokens,
  hashToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate
} from '../utils/token.util.js';

export class AuthService {
  static async register({ name, email, password, role, userAgent, ipAddress }) {
    const emailExists = await UserRepository.existsByEmail(email);
    if (emailExists) {
      throw new AppError(
        'An account with this email already exists',
        HttpStatus.CONFLICT,
        ErrorCode.CONFLICT
      );
    }

    // Agar role object me defined hai toh pick karega, warna hamesha 'user' rahega
    const assignedRole = role || UserRole.USER;

    const user = await UserRepository.create({
      name,
      email,
      password,
      role: assignedRole
    });

    const { accessToken, refreshToken } = generateTokens(user);

    await SessionRepository.create({
      userId: user._id,
      refreshTokenHash: hashToken(refreshToken),
      userAgent,
      ipAddress,
      expiresAt: getRefreshTokenExpiryDate()
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  static async login({ email, password, userAgent, ipAddress }) {
    const user = await UserRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new AppError(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHENTICATED
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHENTICATED
      );
    }

    if (user.status !== 'active') {
      throw new AppError(
        'Your account has been deactivated or suspended',
        HttpStatus.FORBIDDEN,
        ErrorCode.UNAUTHORIZED
      );
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await SessionRepository.create({
      userId: user._id,
      refreshTokenHash: hashToken(refreshToken),
      userAgent,
      ipAddress,
      expiresAt: getRefreshTokenExpiryDate()
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  static async refreshTokens({ incomingRefreshToken, userAgent, ipAddress }) {
    if (!incomingRefreshToken) {
      throw new AppError(
        'Refresh token is required',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHENTICATED
      );
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
      throw new AppError(
        'Refresh token expired or invalid',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHENTICATED
      );
    }

    const incomingHash = hashToken(incomingRefreshToken);
    const session = await SessionRepository.findByTokenHash(incomingHash);

    // AUTOMATIC REUSE DETECTION:
    // If the token is cryptographically valid but the session is missing,
    // this token was already rotated/used before. An attacker might be replaying it!
    if (!session) {
      console.warn(`[SECURITY] Token reuse detected for user ${decoded.sub}. Invalidating all sessions!`);
      await SessionRepository.deleteAllForUser(decoded.sub);
      throw new AppError(
        'Invalid session state. Token reuse detected. Please login again.',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHENTICATED
      );
    }

    // Invalidate the used refresh token immediately
    await SessionRepository.deleteByTokenHash(incomingHash);

    const user = await UserRepository.findById(decoded.sub);
    if (!user || user.status !== 'active') {
      throw new AppError('User account not found or inactive', HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHENTICATED);
    }

    // Issue new pair (Rotation)
    const tokens = generateTokens(user);

    await SessionRepository.create({
      userId: user._id,
      refreshTokenHash: hashToken(tokens.refreshToken),
      userAgent,
      ipAddress,
      expiresAt: getRefreshTokenExpiryDate()
    });

    return tokens;
  }

  static async logout(incomingRefreshToken) {
    if (incomingRefreshToken) {
      const tokenHash = hashToken(incomingRefreshToken);
      await SessionRepository.deleteByTokenHash(tokenHash);
    }
  }
}