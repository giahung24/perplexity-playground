import React, { createContext, useContext, useEffect, useState } from 'react';
import { NextUIProvider } from '@nextui-org/react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('nextui-theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Apply theme to document root
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('nextui-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <NextUIProvider>
        <div className={`${theme} text-foreground bg-background min-h-screen`}>
          {children}
        </div>
      </NextUIProvider>
    </ThemeContext.Provider>
  );
};