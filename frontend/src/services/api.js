import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://salarite-virtual-hr-mvk8.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('salarite_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid token if session has expired
      if (localStorage.getItem('salarite_token')) {
        localStorage.removeItem('salarite_token');
        localStorage.removeItem('salarite_user');
        window.dispatchEvent(new Event('salarite-auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
