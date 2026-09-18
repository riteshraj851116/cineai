import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
      index: true,
    },
    row: {
      type: String,
      required: true,
      uppercase: true,
    },
    number: {
      type: Number,
      required: true,
    },
    seatId: {
      type: String, // e.g. "A1", "F12"
      required: true,
    },
    category: {
      type: String,
      enum: ['Regular', 'Premium', 'Recliner', 'VIP'],
      default: 'Regular',
    },
    priceMultiplier: {
      type: Number,
      default: 1.0,
    },
    isAccessible: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

seatSchema.index({ screen: 1, row: 1, number: 1 }, { unique: true });

export const Seat = mongoose.model('Seat', seatSchema);
