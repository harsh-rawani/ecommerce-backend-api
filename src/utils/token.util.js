import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generate Access and Refresh JWTs with secure entropy
 */
export const generateTokens = (user) => {
  const payload = {
    sub: user._id.toString(),
    role: user.role
  };

  const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN
  });

  // Refresh token includes an internal UUID salt to prevent collision
  const refreshPayload = {
    ...payload,
    jti: crypto.randomUUID()
  };

  const refreshToken = jwt.sign(refreshPayload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN
  });

  return { accessToken, refreshToken };
};

/**
 * Hash raw token strings using SHA-256 before database persistence
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify cryptographic signatures for Access Tokens
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
};

/**
 * Verify cryptographic signatures for Refresh Tokens
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};

/**
 * Calculate absolute Date for Refresh Token expiration
 */
export const getRefreshTokenExpiryDate = () => {
  // Default fallback: 7 days
  const match = config.JWT_REFRESH_EXPIRES_IN.match(/^(\d+)([dhm])$/);
  let ms = 7 * 24 * 60 * 60 * 1000;

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === 'd') ms = value * 24 * 60 * 60 * 1000;
    if (unit === 'h') ms = value * 60 * 60 * 1000;
    if (unit === 'm') ms = value * 60 * 1000;
  }

  return new Date(Date.now() + ms);
};