import apiClient from './apiClient';

/**
 * Control Room & Exhibitor Administration Service
 * Retrieves box office aggregations, revenue trends, and processes AI copilot queries.
 */
export const adminService = {
  getAdminStats: () => apiClient.get('/admin/stats'),
  getAdminCharts: () => apiClient.get('/admin/charts'),
  getTheatreOwnerStats: () => apiClient.get('/admin/theatre-owner/stats'),
  queryAIBusinessAnalytics: (query) => apiClient.post('/admin/ai-analytics', { query }),
};

export default adminService;
