import express from 'express';
import {
  getScreensByTheatre,
  getScreenById,
  createScreen,
  updateScreen,
  deleteScreen,
  getScreenLayout,
} from '../controllers/screenController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.get('/theatre/:theatreId', getScreensByTheatre);
router.get('/:id/layout', getScreenLayout);
router.get('/:id', getScreenById);
router.post('/', protect, authorize('admin', 'theatreOwner'), createScreen);
router.put('/:id', protect, authorize('admin', 'theatreOwner'), updateScreen);
router.delete('/:id', protect, authorize('admin', 'theatreOwner'), deleteScreen);

export default router;
