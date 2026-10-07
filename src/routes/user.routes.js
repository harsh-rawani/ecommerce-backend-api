import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  getMe,
  updateMe,
  changePassword,
  addAddress
} from '../controllers/user.controller.js';
import { updateProfileSchema, addAddressSchema } from '../validators/user.validator.js';
import { changePasswordSchema } from '../validators/auth.validator.js';

const router = Router();

// Protect all routes in this boundary
router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me', validate(updateProfileSchema), updateMe);
router.post('/change-password', validate(changePasswordSchema), changePassword);
router.post('/addresses', validate(addAddressSchema), addAddress);

export default router;