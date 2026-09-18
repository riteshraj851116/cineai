import express from 'express';
import {
  getFoodItems,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
} from '../controllers/foodController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.get('/', getFoodItems);
router.post('/', protect, authorize('admin', 'theatreOwner'), createFoodItem);
router.put('/:id', protect, authorize('admin', 'theatreOwner'), updateFoodItem);
router.delete('/:id', protect, authorize('admin', 'theatreOwner'), deleteFoodItem);

export default router;
