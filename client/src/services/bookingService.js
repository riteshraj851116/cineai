import apiClient from './apiClient';

/**
 * Booking Lifecycle & Checkout Service
 * Manages server-authoritative seat locks, order intents, payment verifications, and cancellations.
 */
export const bookingService = {
  createBookingIntent: (bookingData) => apiClient.post('/bookings/intent', bookingData),
  createBooking: (bookingData) => apiClient.post('/bookings', bookingData),
  confirmBooking: (confirmationData) => apiClient.post('/bookings/confirm', confirmationData),
  getMyBookings: () => apiClient.get('/bookings/my-bookings'),
  getBookingById: (id) => apiClient.get(`/bookings/${id}`),
  cancelBooking: (id, reason = 'Cancelled by patron') => apiClient.post(`/bookings/${id}/cancel`, { reason }),
  getFoodItems: () => apiClient.get('/food'),
  getCoupons: () => apiClient.get('/coupons'),
  validateCoupon: (code, bookingAmount) => apiClient.post('/coupons/validate', { code, bookingAmount }),
};

export default bookingService;
