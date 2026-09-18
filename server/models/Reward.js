import mongoose from 'mongoose';

const rewardItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    pointsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      enum: ['ticket', 'concession', 'upgrade', 'merchandise'],
      default: 'ticket',
    },
    discountCode: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: 'Gift',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const rewardRedemptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RewardItem',
      required: true,
    },
    pointsSpent: {
      type: Number,
      required: true,
    },
    issuedCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'used', 'expired'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
    },
  },
  { timestamps: true }
);

export const RewardItem = mongoose.model('RewardItem', rewardItemSchema);
export const RewardRedemption = mongoose.model('RewardRedemption', rewardRedemptionSchema);
