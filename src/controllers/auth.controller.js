import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpStatus } from '../constants/httpStatusCodes.js';
import { config } from '../config/env.js';

const COOKIE_NAME = 'refreshToken';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'strict',
  path: `${config.API_PREFIX}/auth`, // Scoped strictly to auth routes
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ipAddress = req.ip || req.socket.remoteAddress;

  const result = await AuthService.register({ name, email, password, role, userAgent, ipAddress });

  res.cookie(COOKIE_NAME, result.refreshToken, getCookieOptions());

  return ApiResponse.success(
    res,
    HttpStatus.CREATED,
    'User registered successfully',
    {
      user: result.user,
      accessToken: result.accessToken
    }
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ipAddress = req.ip || req.socket.remoteAddress;

  const result = await AuthService.login({ email, password, userAgent, ipAddress });

  res.cookie(COOKIE_NAME, result.refreshToken, getCookieOptions());

  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Login successful',
    {
      user: result.user,
      accessToken: result.accessToken
    }
  );
});

export const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ipAddress = req.ip || req.socket.remoteAddress;

  const tokens = await AuthService.refreshTokens({
    incomingRefreshToken,
    userAgent,
    ipAddress
  });

  res.cookie(COOKIE_NAME, tokens.refreshToken, getCookieOptions());

  return ApiResponse.success(res, HttpStatus.OK, 'Token refreshed successfully', {
    accessToken: tokens.accessToken
  });
});

export const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  await AuthService.logout(incomingRefreshToken);

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    path: `${config.API_PREFIX}/auth`
  });

  return ApiResponse.success(res, HttpStatus.OK, 'Logged out successfully');
});