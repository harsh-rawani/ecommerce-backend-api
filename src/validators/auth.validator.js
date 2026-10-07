import { z } from 'zod';
import { UserRole } from '../constants/roles.js';

const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

export const registerSchema = {
  body: z
    .object({
      name: z
        .string({ required_error: 'Name is required' })
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters'),
      email: z
        .string({ required_error: 'Email is required' })
        .trim()
        .toLowerCase()
        .email('Invalid email address format'),
      password: passwordSchema,
      // Agar role aaya toh validate karega, nahi aaya toh default 'user' set kar dega
      role: z.enum([UserRole.USER, UserRole.ADMIN]).optional().default(UserRole.USER)
    })
    .strict()
};

export const loginSchema = {
  body: z
    .object({
      email: z
        .string({ required_error: 'Email is required' })
        .trim()
        .toLowerCase()
        .email('Invalid email address format'),
      password: z.string({ required_error: 'Password is required' })
    })
    .strict()
};

export const changePasswordSchema = {
  body: z
    .object({
      currentPassword: z.string({ required_error: 'Current password is required' }),
      newPassword: passwordSchema
    })
    .strict()
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'New password must be different from current password',
      path: ['newPassword']
    })
};