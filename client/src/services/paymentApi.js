import apiClient from './apiClient';

export const paymentApi = {
  createOrder: (orderData) => apiClient.post('/payments/create-order', orderData),
  verifyPayment: (paymentData) => apiClient.post('/payments/verify', paymentData),
};

export default paymentApi;
