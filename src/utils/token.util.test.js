import { describe, it, expect } from 'vitest';
import {
  generateTokens,
  hashToken,
  verifyAccessToken,
  verifyRefreshToken
} from '../../src/utils/token.util.js';

describe('Token Utility Unit Tests', () => {
  const mockUser = {
    _id: '65f1a2b3c4d5e6f7a8b9c0d1',
    role: 'user'
  };

  it('should generate valid access and refresh tokens with correct payload', () => {
    const { accessToken, refreshToken } = generateTokens(mockUser);

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    const decodedAccess = verifyAccessToken(accessToken);
    expect(decodedAccess.sub).toBe(mockUser._id);
    expect(decodedAccess.role).toBe(mockUser.role);

    const decodedRefresh = verifyRefreshToken(refreshToken);
    expect(decodedRefresh.sub).toBe(mockUser._id);
    expect(decodedRefresh.jti).toBeDefined();
  });

  it('hashToken should return deterministic SHA-256 hex string', () => {
    const rawToken = 'sample-jwt-token-string';
    const hash1 = hashToken(rawToken);
    const hash2 = hashToken(rawToken);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 output length
  });
});