import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const authToken = sessionStorage.getItem('rag-auth-token');
    if (authToken) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (password) => {
    const correctPassword = process.env.REACT_APP_PASSWORD || 'secure123';
    
    if (password === correctPassword) {
      // Generate a simple session token
      const token = btoa(Date.now().toString());
      sessionStorage.setItem('rag-auth-token', token);
      setIsAuthenticated(true);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid password' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('rag-auth-token');
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};