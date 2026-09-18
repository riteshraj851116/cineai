import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true, // e.g., "Screen 1 - IMAX Laser"
    },
    screenType: {
      type: String,
      enum: ['IMAX', '4DX', 'Dolby Cinema', 'Standard 2D/3D'],
      default: 'Dolby Cinema',
    },
    rows: {
      type: Number,
      default: 8, // Rows A to H
    },
    columns: {
      type: Number,
      default: 12, // 12 seats per row
    },
    totalSeats: {
      type: Number,
      default: 96,
    },
    seatCategories: [{
      name: {
        type: String,
        enum: ['Regular', 'Premium', 'Recliner', 'VIP'],
        required: true,
      },
      rows: [String], // e.g. ['A', 'B']
      basePrice: { type: Number, required: true },
    }],
  },
  { timestamps: true }
);

export const Screen = mongoose.model('Screen', screenSchema);
