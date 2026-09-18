import mongoose from 'mongoose';

const lockedSeatSchema = new mongoose.Schema({
  seatId: { type: String, required: true },
  lockedBy: { type: String, required: true }, // socket id or user id
  lockedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true,
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD' for exact day filtering
      required: true,
      index: true,
    },
    startTime: {
      type: String, // '14:30'
      required: true,
    },
    endTime: {
      type: String, // '17:15'
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX'],
      default: '2D',
    },
    pricing: {
      Regular: { type: Number, default: 220 },
      Premium: { type: Number, default: 350 },
      Recliner: { type: Number, default: 550 },
      VIP: { type: Number, default: 750 },
    },
    totalSeats: {
      type: Number,
      default: 96,
    },
    availableSeatsCount: {
      type: Number,
      default: 96,
    },
    occupiedSeats: [{
      type: String, // list of seatIds e.g. "B4", "B5"
    }],
    lockedSeats: [lockedSeatSchema],
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

showSchema.index({ movie: 1, theatre: 1, date: 1 });
showSchema.index({ date: 1, status: 1 });

export const Show = mongoose.model('Show', showSchema);
