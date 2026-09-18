export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  THEATRE_OWNER: 'theatreOwner',
};

export const CITIES = [
  'Mumbai',
  'Delhi-NCR',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Noida',
  'Gurugram',
  'Patna',
];

export const FORMATS = ['2D', '3D', 'IMAX', '4DX'];

export const SEAT_CATEGORIES = {
  REGULAR: 'Regular',
  PREMIUM: 'Premium',
  RECLINER: 'Recliner',
  VIP: 'VIP',
};

export const SEAT_PRICE_MULTIPLIERS = {
  Regular: 1.0,
  Premium: 1.35,
  Recliner: 1.8,
  VIP: 2.2,
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const SEAT_LOCK_TTL_SECONDS = 420; // 7 minutes
