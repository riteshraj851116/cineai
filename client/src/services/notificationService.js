import apiClient from './apiClient';

/**
 * Patron Notifications Service
 * Delivers alerts for confirmed bookings, promotional offers, and screening reminders.
 */
export const notificationService = {
  getNotifications: () => apiClient.get('/notifications'),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
};

export default notificationService;
