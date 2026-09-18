import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    seats: [{
      seatId: { type: String, required: true },
      row: { type: String, required: true },
      number: { type: Number, required: true },
      category: { type: String, required: true },
      price: { type: Number, required: true },
    }],
    foodItems: [{
      foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }],
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    paymentId: {
      type: String,
      default: null,
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrCode: {
      type: String, // Base64 data URL
      default: '',
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    refundedAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ show: 1, bookingStatus: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
