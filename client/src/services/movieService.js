import apiClient from './apiClient';

/**
 * Movie Catalog & Discovery Service
 * Queries theatrical listings, metadata, search filtering, and trending titles.
 */
export const movieService = {
  getMovies: (params = {}) => apiClient.get('/movies', { params }),
  getMovieById: (id) => apiClient.get(`/movies/${id}`),
  getMovieBySlug: (slug) => apiClient.get(`/movies/slug/${slug}`),
  getTrendingMovies: (limit = 6) => apiClient.get('/movies', { params: { limit, sort: '-rating' } }),
  toggleWatchlist: (movieId) => apiClient.post('/users/watchlist', { movieId }),
};

export default movieService;
