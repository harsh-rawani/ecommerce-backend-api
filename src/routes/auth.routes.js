import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alex Mercer
 *               email:
 *                 type: string
 *                 example: alex@example.com
 *               password:
 *                 type: string
 *                 example: SecurePassword123!
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *     responses:
 *       201:
 *         description: User registered successfully. Returns accessToken and sets httpOnly refresh cookie.
 *       400:
 *         description: Validation error.
 *       409:
 *         description: Email already registered.
 */
router.post('/register', validate(registerSchema), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: alex@example.com
 *               password:
 *                 type: string
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: Authentication successful. Returns accessToken and sets refreshToken cookie.
 *       401:
 *         description: Invalid credentials.
 *       429:
 *         description: Rate limit exceeded (brute-force defense).
 */
router.post('/login', validate(loginSchema), login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh Access Token
 *     tags: [Authentication]
 *     description: Rotates refresh token and issues a new access token via httpOnly cookie.
 *     responses:
 *       200:
 *         description: Token successfully rotated.
 *       401:
 *         description: Token expired, invalid, or reuse attempt detected.
 */
router.post('/refresh', refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     description: Clears refresh session from datastore and purges cookies.
 *     responses:
 *       200:
 *         description: Logged out cleanly.
 */
router.post('/logout', logout);

export default router;