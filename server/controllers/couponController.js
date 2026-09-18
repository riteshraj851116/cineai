import { Coupon } from '../models/Coupon.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const amount = Number(req.body.amount !== undefined ? req.body.amount : req.body.bookingAmount || 0);
    if (!code) return res.status(400).json({ success: false, message: 'Please provide a coupon code' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (amount < coupon.minimumAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimumAmount} required for this coupon.`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.min((amount * coupon.discountValue) / 100, coupon.maximumDiscount);
    } else {
      discount = Math.min(coupon.discountValue, coupon.maximumDiscount);
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: Math.round(discount),
      },
      message: `Coupon "${coupon.code}" applied! You saved ₹${Math.round(discount)}.`,
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ active: true, expiryDate: { $gte: new Date() } });
    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};
