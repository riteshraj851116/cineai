import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/mark-all-read', protect, markAllRead);
router.put('/read-all', protect, markAllRead);

export default router;

