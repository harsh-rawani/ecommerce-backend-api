import { z } from 'zod';

export const updateProfileSchema = {
  body: z
    .object({
      name: z.string().trim().min(2).max(50).optional()
    })
    .strict()
};

export const addAddressSchema = {
  body: z
    .object({
      street: z.string().trim().min(3),
      city: z.string().trim().min(2),
      state: z.string().trim().min(2),
      postalCode: z.string().trim().min(3),
      country: z.string().trim().length(2).toUpperCase(), // ISO 3166-1 alpha-2 (e.g. IN, US)
      isDefault: z.boolean().optional().default(false)
    })
    .strict()
};