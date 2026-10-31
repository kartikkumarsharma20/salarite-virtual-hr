import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.access_token) {
      localStorage.setItem('salarite_token', response.data.access_token);
      localStorage.setItem('salarite_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    if (response.data) {
      localStorage.setItem('salarite_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('salarite_token');
    localStorage.removeItem('salarite_user');
  },

  getStoredUser() {
    try {
      const stored = localStorage.getItem('salarite_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getStoredToken() {
    return localStorage.getItem('salarite_token');
  },
};
