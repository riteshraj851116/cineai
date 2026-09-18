import apiClient from './apiClient';

/**
 * Patron Personal Watchlist Service
 * Handles bookmarking anticipated screenings and personal watch histories.
 */
export const watchlistService = {
  getWatchlist: () => apiClient.get('/users/watchlist'),
  toggleWatchlist: (movieId) => apiClient.post('/users/watchlist', { movieId }),
  removeFromWatchlist: (movieId) => apiClient.delete(`/users/watchlist/${movieId}`),
};

export default watchlistService;
