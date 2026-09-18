import apiClient from './apiClient';

/**
 * Patron Reviews & Community Service
 * Manages verified screening critiques, applause likes, and discussion comments.
 */
export const reviewService = {
  getReviewsByMovie: (movieId) => apiClient.get(`/reviews/movie/${movieId}`),
  submitReview: (reviewData) => apiClient.post('/reviews', reviewData),
  likeReview: (reviewId) => apiClient.post(`/reviews/${reviewId}/like`),
  addComment: (reviewId, text) => apiClient.post(`/reviews/${reviewId}/comment`, { text }),
  getCommunityFeed: (params = {}) => apiClient.get('/reviews/feed', { params }),
  updateReview: (reviewId, reviewData) => apiClient.put(`/reviews/${reviewId}`, reviewData),
};

export default reviewService;
