import apiClient from './apiClient';

/**
 * Authentication & Patron Session Service
 * Manages JWT credential exchanges, patron registration, and persistent profile state.
 */
export const authService = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (userData) => apiClient.post('/auth/register', userData),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (profileData) => apiClient.put('/users/profile', profileData),
};

export default authService;
