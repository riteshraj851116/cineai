import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
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
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment cannot be empty'],
      trim: true,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    sentiment: {
      type: String,
      enum: ['positive', 'mixed', 'negative'],
      default: 'positive',
    },
    aspects: {
      story: { type: Number, min: 1, max: 5, default: 4 },
      acting: { type: Number, min: 1, max: 5, default: 4 },
      direction: { type: Number, min: 1, max: 5, default: 4 },
      music: { type: Number, min: 1, max: 5, default: 4 },
      visuals: { type: Number, min: 1, max: 5, default: 5 },
      pacing: { type: Number, min: 1, max: 5, default: 4 },
    },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      comment: {
        type: String,
        required: true,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  { timestamps: true }
);

reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
