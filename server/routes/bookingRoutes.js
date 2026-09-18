import express from 'express';
import {
  createBookingIntent,
  confirmBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createBookingIntent);
router.post('/intent', protect, createBookingIntent);
router.post('/confirm', protect, confirmBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.post('/:id/cancel', protect, cancelBooking);

export default router;
