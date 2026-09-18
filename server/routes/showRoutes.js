import express from 'express';
import {
  getShows,
  getShowById,
  createShow,
  updateShowPricing,
  deleteShow,
} from '../controllers/showController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.get('/', getShows);
router.get('/:id', getShowById);

router.post('/', protect, authorize('admin', 'theatreOwner'), createShow);
router.put('/:id/pricing', protect, authorize('admin', 'theatreOwner'), updateShowPricing);
router.delete('/:id', protect, authorize('admin', 'theatreOwner'), deleteShow);

export default router;
