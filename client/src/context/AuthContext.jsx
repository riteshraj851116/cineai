import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cineai_token');
      const storedUser = localStorage.getItem('cineai_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const { data } = await authService.getCurrentUser();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('cineai_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.error('[AuthContext] Session verification failed:', err.message);
          localStorage.removeItem('cineai_token');
          localStorage.removeItem('cineai_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await authService.login(email, password);
    if (data.success) {
      localStorage.setItem('cineai_token', data.token);
      localStorage.setItem('cineai_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    }
  };

  const register = async (userData) => {
    const { data } = await authService.register(userData);
    if (data.success) {
      localStorage.setItem('cineai_token', data.token);
      localStorage.setItem('cineai_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('cineai_token');
    localStorage.removeItem('cineai_user');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const { data } = await authService.updateProfile(updates);
    if (data.success) {
      setUser(data.user);
      localStorage.setItem('cineai_user', JSON.stringify(data.user));
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
