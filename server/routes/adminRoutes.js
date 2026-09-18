import express from 'express';
import {
  getAdminStats,
  getAdminCharts,
  getTheatreOwnerStats,
  askAdminAI,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/charts', protect, authorize('admin'), getAdminCharts);
router.post('/ai-analytics', protect, authorize('admin'), askAdminAI);

router.get('/theatre-owner/stats', protect, authorize('admin', 'theatreOwner'), getTheatreOwnerStats);

export default router;
