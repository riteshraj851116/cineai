import QRCode from 'qrcode';
import { Booking } from '../models/Booking.js';
import { Show } from '../models/Show.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { Coupon } from '../models/Coupon.js';
import { SeatLockService } from '../services/seatLockService.js';
import { PaymentService } from '../services/paymentService.js';
import { BookingPricingService } from '../services/bookingPricingService.js';

export const createBookingIntent = async (req, res, next) => {
  try {
    const {
      showId,
      seats = [],
      foodItems = [],
      couponCode,
      socketId,
    } = req.body;

    const show = await Show.findById(showId)
      .populate('movie', 'title poster duration')
      .populate('theatre', 'name city address')
      .populate('screen', 'name');

    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    const seatIds = seats.map((s) => s.seatId);

    // Atomically reserve requested seats via TTL lock to prevent race conditions
    // Allows claiming seats previously held by user's socket session
    try {
      await SeatLockService.lockSeats(show._id, seatIds, req.user.id, socketId);
    } catch (lockErr) {
      return res.status(400).json({ success: false, message: lockErr.message });
    }

    // Calculate server-authoritative financial breakdown (seats, concessions, discounts, taxes)
    const pricing = await BookingPricingService.calculateBookingTotal({
      show,
      seats,
      foodItems,
      couponCode,
    });

    const bookingReference = `CINE-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Persist pending booking order
    const movieId = show.movie?._id || show.movie;
    const theatreId = show.theatre?._id || show.theatre;
    const screenId = show.screen?._id || show.screen;

    const booking = await Booking.create({
      user: req.user.id,
      movie: movieId,
      theatre: theatreId,
      screen: screenId,
      show: show._id,
      seats: pricing.validatedSeats,
      foodItems: pricing.validatedFood,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      couponCode: pricing.appliedCoupon,
      tax: pricing.convenienceFee,
      totalAmount: pricing.totalAmount,
      bookingReference,
      bookingStatus: 'pending',
      paymentStatus: 'pending',
    });

    // Create payment gateway order intent
    const orderData = await PaymentService.createOrder({
      amount: pricing.totalAmount,
      receipt: bookingReference,
      userId: req.user.id,
      bookingId: booking._id,
    });

    res.status(201).json({
      success: true,
      booking,
      orderData,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmBooking = async (req, res, next) => {
  try {
    const { bookingId, paymentId, orderId, signature } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('movie')
      .populate('theatre')
      .populate('screen')
      .populate('show');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.bookingStatus === 'confirmed') {
      return res.json({ success: true, booking, message: 'Booking already confirmed' });
    }

    // Backend verification of payment signature
    const isValid = await PaymentService.verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
      bookingId: booking._id,
      userId: req.user?.id,
    });

    if (!isValid) {
      booking.paymentStatus = 'failed';
      await booking.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Mark seats as permanently occupied in the show
    const seatIds = booking.seats.map((s) => s.seatId);
    const showId = booking.show?._id || booking.show;
    await SeatLockService.confirmSeatsOccupied(showId, seatIds);

    // Broadcast updated live state to any connected patrons
    const io = req.app.get('io');
    if (io) {
      try {
        const liveState = await SeatLockService.getLiveSeatState(showId);
        io.to(`show:${showId}`).emit('seat_state_sync', liveState);
      } catch (_e) {}
    }

    // Generate cryptographic QR Code data URL
    const movieTitle = booking.movie?.title || 'CineAI Premiere';
    const theatreName = booking.theatre?.name || 'CineAI Multiplex';
    const showDate = booking.show?.date || new Date().toISOString().split('T')[0];
    const showTimeStr = booking.show?.startTime || 'Evening Show';

    const qrPayload = JSON.stringify({
      ref: booking.bookingReference,
      movie: movieTitle,
      theatre: theatreName,
      showTime: `${showDate} ${showTimeStr}`,
      seats: seatIds,
      amount: booking.totalAmount,
      verifyHash: Buffer.from(booking.bookingReference + booking._id).toString('base64'),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      color: { dark: '#00F0FF', light: '#0A0E1A' },
      width: 280,
      margin: 2,
    });

    // Update booking status
    booking.bookingStatus = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentId = paymentId;
    booking.qrCode = qrCodeDataUrl;
    await booking.save();

    // Reward loyalty points (10% of total spend) & update user history
    const earnedPoints = Math.floor(booking.totalAmount * 0.1);
    const userMovieId = booking.movie?._id || booking.movie;
    await User.findByIdAndUpdate(booking.user, {
      $inc: { loyaltyPoints: earnedPoints },
      ...(userMovieId ? {
        $push: {
          watchHistory: { movie: userMovieId, watchedAt: new Date() },
        },
      } : {}),
    });

    // If coupon used, increment count
    if (booking.couponCode) {
      await Coupon.findOneAndUpdate({ code: booking.couponCode }, { $inc: { usedCount: 1 } });
    }

    // Create in-app notification
    await Notification.create({
      user: booking.user,
      title: 'Booking Confirmed! 🍿',
      message: `Your booking for "${movieTitle}" at ${theatreName} (${booking.seats.length} ticket(s)) is confirmed. Ref: ${booking.bookingReference}`,
      type: 'booking',
      metadata: { bookingId: booking._id, reference: booking.bookingReference },
    });

    res.json({
      success: true,
      booking,
      earnedPoints,
      message: 'Booking confirmed successfully!',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user.id };

    if (status === 'upcoming') {
      filter.bookingStatus = 'confirmed';
    } else if (status === 'cancelled') {
      filter.bookingStatus = 'cancelled';
    }

    const bookings = await Booking.find(filter)
      .populate('movie', 'title poster backdrop duration genres formats rating')
      .populate('theatre', 'name city address facilities')
      .populate('screen', 'name screenType')
      .populate('show', 'startTime endTime date format language')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('screen')
      .populate('show')
      .populate('user', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Authorization check (user can only view their booking unless admin)
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('movie show');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Release seats back to available pool
    const seatIds = booking.seats.map((s) => s.seatId);
    await SeatLockService.releaseOccupiedSeats(booking.show._id, seatIds);

    // Process refund workflow (test mode 90% refund after nominal fee)
    const refundAmount = Math.round(booking.totalAmount * 0.9);
    await PaymentService.processRefund({
      paymentId: booking.paymentId,
      amount: refundAmount,
    });

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.refundedAmount = refundAmount;
    await booking.save();

    // Adjust CinePoints
    const pointsToDeduct = Math.floor(booking.totalAmount * 0.1);
    await User.findByIdAndUpdate(booking.user, {
      $inc: { loyaltyPoints: -pointsToDeduct, walletBalance: refundAmount },
    });

    // Send cancellation notification
    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled & Refund Initiated',
      message: `Your booking for "${booking.movie.title}" has been cancelled. ₹${refundAmount} has been refunded to your wallet.`,
      type: 'cancellation',
      metadata: { bookingId: booking._id, refundAmount },
    });

    res.json({
      success: true,
      message: 'Booking cancelled and refund processed successfully.',
      booking,
      refundAmount,
    });
  } catch (error) {
    next(error);
  }
};
