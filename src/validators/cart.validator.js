import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid MongoDB ObjectId'
});

export const addToCartSchema = {
  body: z
    .object({
      productId: objectIdSchema,
      quantity: z.number().int().positive().max(50).default(1)
    })
    .strict()
};

export const updateCartItemSchema = {
  params: z.object({
    itemId: objectIdSchema
  }),
  body: z
    .object({
      quantity: z.number().int().positive().max(50)
    })
    .strict()
};

export const removeCartItemSchema = {
  params: z.object({
    itemId: objectIdSchema
  })
};