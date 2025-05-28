// API Context Provider
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/apiService';

// Create context
export const ApiContext = createContext();

const ApiContextProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const { data } = await authAPI.getProfile();
          
          if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
            setIsAdmin(data.user.role === 'admin');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Login handler
  const login = async (credentials) => {
    try {
      const { data } = await authAPI.login(credentials);
      
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setIsAdmin(data.user.role === 'admin');
        return { success: true };
      }
      
      return { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };
  
  // Register handler
  const register = async (userData) => {
    try {
      const { data } = await authAPI.register(userData);
      
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setIsAdmin(data.user.role === 'admin');
        return { success: true };
      }
      
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };
  
  // Logout handler
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };
  
  // Update profile handler
  const updateProfile = async (userData) => {
    try {
      const { data } = await authAPI.updateProfile(userData);
      
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      
      return { success: false, message: 'Profile update failed' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };
  
  const value = {
    user,
    isAuthenticated,
    isAdmin,
    authLoading,
    login,
    register,
    logout,
    updateProfile
  };
  
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

// Custom hook for using the API context
export const useApi = () => {
  const context = useContext(ApiContext);
  
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiContextProvider');
  }
  
  return context;
};

export default ApiContextProvider;
