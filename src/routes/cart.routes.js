import { Router } from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cart.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema
} from '../validators/cart.validator.js';

const router = Router();

// Sabhi cart routes par user authenticated hona mandatory hai
router.use(requireAuth);

router.get('/', getCart);
router.post('/items', validate(addToCartSchema), addItemToCart);
router.patch('/items/:itemId', validate(updateCartItemSchema), updateCartItem);
router.delete('/items/:itemId', validate(removeCartItemSchema), removeCartItem);
router.delete('/', clearCart);

export default router;