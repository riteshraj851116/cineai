import apiClient from './apiClient';

/**
 * Theatrical Showtime & Screening Service
 * Fetches show allocations by movie, venue, date, and allows exhibitors to schedule new screenings.
 */
export const showService = {
  getShows: (params = {}) => apiClient.get('/shows', { params }),
  getShowById: (id) => apiClient.get(`/shows/${id}`),
  getSeatsByShow: (showId) => apiClient.get(`/seats/show/${showId}`),
  scheduleScreening: (showData) => apiClient.post('/shows', showData),
  updateShowPricing: (showId, pricing) => apiClient.put(`/shows/${showId}/pricing`, { pricing }),
};

export default showService;
