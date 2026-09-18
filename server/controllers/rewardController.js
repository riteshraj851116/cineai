import { RewardItem, RewardRedemption } from '../models/Reward.js';
import { User } from '../models/User.js';
import crypto from 'crypto';

export const getRewards = async (req, res, next) => {
  try {
    let items = await RewardItem.find({ active: true }).sort({ pointsRequired: 1 });

    // Auto-seed default rewards if none exist
    if (items.length === 0) {
      items = await RewardItem.create([
        {
          title: 'Free Gourmet Popcorn (Salted/Caramel)',
          description: '1 complimentary regular popcorn tub at any CineAI participating multiplex concession.',
          pointsRequired: 150,
          category: 'concession',
          discountCode: 'POPCORN150',
          icon: 'Popcorn',
        },
        {
          title: '₹100 Off Movie Admission',
          description: 'Instant ₹100 credit on any standard or recliner showtime booking.',
          pointsRequired: 250,
          category: 'discount',
          discountCode: 'CINE100',
          icon: 'Ticket',
        },
        {
          title: 'IMAX Laser Experience Upgrade',
          description: 'Upgrade any standard screen ticket to IMAX Laser at no additional cash charge.',
          pointsRequired: 400,
          category: 'upgrade',
          discountCode: 'IMAXUPGRADE',
          icon: 'Sparkles',
        },
        {
          title: 'Beverage & Snack Bundle',
          description: 'Large fountain soda + Nachos with warm artisanal cheese dip.',
          pointsRequired: 300,
          category: 'concession',
          discountCode: 'COMBO300',
          icon: 'Coffee',
        },
        {
          title: 'VIP Lounge & Director Ticket Pass',
          description: '1 completely free admission ticket including lounge access and priority entry.',
          pointsRequired: 800,
          category: 'ticket',
          discountCode: 'VIPPASS800',
          icon: 'Crown',
        },
      ]);
    }

    let userRedemptions = [];
    let userPoints = 0;
    if (req.user) {
      const user = await User.findById(req.user.id);
      userPoints = user ? user.loyaltyPoints : 0;
      userRedemptions = await RewardRedemption.find({ user: req.user.id })
        .populate('reward')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      userPoints,
      rewards: items,
      redemptions: userRedemptions,
    });
  } catch (error) {
    next(error);
  }
};

export const redeemReward = async (req, res, next) => {
  try {
    const { rewardId } = req.body;
    if (!rewardId) {
      return res.status(400).json({ success: false, message: 'Please specify a reward to redeem' });
    }

    const reward = await RewardItem.findById(rewardId);
    if (!reward || !reward.active) {
      return res.status(404).json({ success: false, message: 'Reward not found or inactive' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.loyaltyPoints < reward.pointsRequired) {
      return res.status(400).json({
        success: false,
        message: `Insufficient CinePoints. You have ${user.loyaltyPoints} pts, but this reward requires ${reward.pointsRequired} pts.`,
      });
    }

    // Deduct points
    user.loyaltyPoints -= reward.pointsRequired;
    await user.save();

    // Generate unique redemption code
    const issuedCode = `REWD-${reward.discountCode || 'PERK'}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const redemption = await RewardRedemption.create({
      user: user._id,
      reward: reward._id,
      pointsSpent: reward.pointsRequired,
      issuedCode,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      message: `Successfully redeemed "${reward.title}"! Voucher code: ${issuedCode}`,
      issuedCode,
      remainingPoints: user.loyaltyPoints,
      redemption,
    });
  } catch (error) {
    next(error);
  }
};
