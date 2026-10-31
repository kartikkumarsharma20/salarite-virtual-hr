import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getStoredToken());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Validate or fetch current user on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = authService.getStoredToken();
      if (storedToken) {
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
        } catch (err) {
          console.error('Failed to restore active session:', err);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for 401 session expirations from API interceptor
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('salarite-auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('salarite-auth-expired', handleAuthExpired);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setToken(data.access_token);
      return data.user;
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Unable to log in. Please verify your credentials.';
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setAuthError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
      return freshUser;
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    authError,
    isAuthenticated: Boolean(token && user),
    isEmployer: user?.role?.toLowerCase() === 'employer',
    isVirtualHR: user?.role?.toLowerCase() === 'virtual_hr',
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
