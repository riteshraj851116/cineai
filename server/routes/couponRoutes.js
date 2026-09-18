import express from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
} from '../controllers/couponController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/', getCoupons);
router.post('/', protect, authorize('admin'), createCoupon);

export default router;
