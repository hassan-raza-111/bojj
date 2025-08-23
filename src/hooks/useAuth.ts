import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, apiCall } from '@/config/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  bio?: string;
  phone?: string;
  location?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Store tokens and user data
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('isAuthenticated', 'true');

      setUser(data.data.user);
      setIsAuthenticated(true);

      return data.data.user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const data = await apiCall(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return data.data.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');

    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const data = await apiCall(
        API_CONFIG.ENDPOINTS.AUTH.ME,
        {
          method: 'PATCH',
          body: JSON.stringify(userData),
        },
        true
      );

      // Update local storage and state
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);

      return data.data.user;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const data = await apiCall(
        API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          method: 'PATCH',
          body: JSON.stringify({ currentPassword, newPassword }),
        },
        true
      );

      return data.message;
    } catch (error) {
      throw error;
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    getAuthHeaders,
    checkAuthStatus,
  };
};
