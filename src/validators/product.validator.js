import { z } from 'zod';

export const createProductSchema = {
  body: z
    .object({
      name: z.string().trim().min(3).max(120),
      description: z.string().trim().min(10).max(2000),
      price: z.number().positive('Price must be greater than zero'),
      discountPrice: z.number().positive().optional().nullable(),
      category: z.string().trim().min(2).toLowerCase(),
      brand: z.string().trim().min(2),
      stock: z.number().int().nonnegative('Stock cannot be negative'),
      isAvailable: z.boolean().optional().default(true),
      images: z.array(z.string().url('Image must be a valid URL')).min(1)
    })
    .strict()
    .refine(
      (data) => !data.discountPrice || data.discountPrice < data.price,
      {
        message: 'Discount price must be less than base price',
        path: ['discountPrice']
      }
    )
};

export const queryProductsSchema = {
  query: z
    .object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20),
      category: z.string().trim().toLowerCase().optional(),
      minPrice: z.coerce.number().nonnegative().optional(),
      maxPrice: z.coerce.number().positive().optional(),
      search: z.string().trim().optional(),
      sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating']).default('newest')
    })
    .strict()
};