import { PaymentService } from '../services/paymentService.js';

export const createOrder = async (req, res, next) => {
  try {
    const { amount, receipt, bookingId, method } = req.body;
    const orderData = await PaymentService.createOrder({
      amount,
      receipt,
      userId: req.user ? req.user.id : null,
      bookingId,
      method: method || 'card',
    });
    res.json({ success: true, orderData });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, bookingId } = req.body;
    const isValid = await PaymentService.verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
      bookingId,
      userId: req.user ? req.user.id : null,
    });
    res.json({ success: isValid });
  } catch (error) {
    next(error);
  }
};

