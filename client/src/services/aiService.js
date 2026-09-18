import apiClient from './apiClient';

/**
 * CineAI Neural Concierge & Recommendation Service
 * Communicates with AI concierge, natural language search, and acoustic seat positioning algorithms.
 */
export const aiService = {
  askAIConcierge: (message, sessionId = 'cine-session', city = 'Mumbai') =>
    apiClient.post('/ai/chat', { message, sessionId, city }),
  sendChatMessage: (message, sessionId = 'cine-session', city = 'Mumbai') =>
    apiClient.post('/ai/chat', { message, sessionId, city }),
  searchMoviesNeural: (query) => apiClient.post('/ai/search', { query }),
  searchMovies: (query) => apiClient.post('/ai/search', { query }),
  getReviewSummary: (movieId) => apiClient.get(`/ai/review-summary/${movieId}`),
  getSeatRecommendations: (showId, seatsWanted = 2, preference = 'CENTER') =>
    apiClient.post('/ai/recommend-seats', { showId, seatsWanted, preference }),
  getWeekendPlanner: (preferences) => apiClient.post('/ai/weekend-planner', preferences),
  matchMoodToMovie: (moodData) => apiClient.post('/ai/mood-match', moodData),
};

export default aiService;
