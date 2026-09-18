import apiClient from './apiClient';

/**
 * Cinema & Multiplex Service
 * Handles theatre locations, venue amenities (IMAX, Dolby Atmos), and auditorium details.
 */
export const cinemaService = {
  getCinemas: (params = {}) => apiClient.get('/theatres', { params }),
  getTheatres: (params = {}) => apiClient.get('/theatres', { params }),
  getCinemaById: (id) => apiClient.get(`/theatres/${id}`),
  getTheatreById: (id) => apiClient.get(`/theatres/${id}`),
};

export default cinemaService;
