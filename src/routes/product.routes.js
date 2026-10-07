import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createProductSchema, queryProductsSchema } from '../validators/product.validator.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// Public routes
router.get('/', validate(queryProductsSchema), getProducts);
router.get('/:slug', getProductBySlug);

// Admin routes (RBAC protected)
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate(createProductSchema),
  createProduct
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN),
  updateProduct
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.ADMIN),
  deleteProduct
);

export default router;