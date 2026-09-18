import express from 'express';
import {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
} from '../controllers/theatreController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.get('/', getTheatres);
router.get('/:id', getTheatreById);

router.post('/', protect, authorize('admin', 'theatreOwner'), createTheatre);
router.put('/:id', protect, authorize('admin', 'theatreOwner'), updateTheatre);

export default router;
