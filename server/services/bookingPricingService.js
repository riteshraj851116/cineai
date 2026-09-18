import { Coupon } from '../models/Coupon.js';
import { FoodItem } from '../models/FoodItem.js';

/**
 * Server-Authoritative Cinema Booking Pricing Service
 *
 * Enforces strict backend calculation of ticket prices, gourmet concessions,
 * promotional coupons, and platform convenience fees. Never trusts client totals.
 */
export class BookingPricingService {
  /**
   * Calculate complete order financial breakdown
   *
   * @param {Object} params
   * @param {Object} params.show - Populated Mongoose Show document
   * @param {Array} params.seats - Array of seat requests: [{ seatId, row, number, category }]
   * @param {Array} params.foodItems - Array of concession requests: [{ foodItem: id, quantity }]
   * @param {String} [params.couponCode] - Optional promotional coupon code
   * @returns {Promise<Object>} Calculated financial totals and validated order items
   */
  static async calculateBookingTotal({ show, seats = [], foodItems = [], couponCode = null }) {
    // 1. Seat Tier Pricing
    let seatsTotal = 0;
    const validatedSeats = seats.map((seat) => {
      // Look up tier price strictly from the show's database configuration
      const tierKey = seat.category || 'Regular';
      const tierPrice = Number(
        show.pricing?.[tierKey] ||
        show.pricing?.[tierKey.toLowerCase()] ||
        show.pricing?.Regular ||
        250
      );

      seatsTotal += tierPrice;
      return {
        seatId: seat.seatId,
        row: seat.row,
        number: seat.number,
        category: tierKey,
        price: tierPrice,
      };
    });

    // 2. Concession & Gourmet Food Pricing (Server-Queried from DB)
    let foodTotal = 0;
    const validatedFood = [];

    for (const item of foodItems) {
      if (item.foodItem && item.quantity > 0) {
        const foodDoc = await FoodItem.findById(item.foodItem);
        if (foodDoc) {
          const itemPrice = foodDoc.price;
          foodTotal += itemPrice * item.quantity;
          validatedFood.push({
            foodItem: foodDoc._id,
            name: foodDoc.name,
            quantity: item.quantity,
            price: itemPrice,
          });
        }
      }
    }

    const subtotal = seatsTotal + foodTotal;

    // 3. Coupon Validation and Discount Calculation
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const normalizedCode = String(couponCode).trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: normalizedCode, active: true });

      if (coupon) {
        const isNotExpired = new Date(coupon.expiryDate) > new Date();
        const meetsMinAmount = subtotal >= (coupon.minimumAmount || 0);

        if (isNotExpired && meetsMinAmount) {
          if (coupon.discountType === 'percentage') {
            const rawDiscount = (subtotal * coupon.discountValue) / 100;
            discount = Math.min(rawDiscount, coupon.maximumDiscount || rawDiscount);
          } else {
            discount = Math.min(coupon.discountValue, coupon.maximumDiscount || coupon.discountValue);
          }
          appliedCoupon = coupon.code;
        }
      }
    }

    // 4. Convenience Fee (fixed standard exhibition booking fee)
    const convenienceFee = seats.length > 0 ? 60 : 0;

    // 5. Final Net Payable Amount
    const totalAmount = Math.max(0, subtotal - discount + convenienceFee);

    return {
      seatsTotal,
      foodTotal,
      subtotal,
      discount: Math.round(discount),
      appliedCoupon,
      convenienceFee,
      totalAmount: Math.round(totalAmount),
      validatedSeats,
      validatedFood,
    };
  }
}

export default BookingPricingService;
