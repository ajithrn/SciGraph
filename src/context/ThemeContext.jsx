import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('scigraph-theme') || 'dark';
    }
    return 'dark';
  });

  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('scigraph-font-size')) || 15;
    }
    return 15;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('scigraph-theme', theme);
  }, [theme]);

  // Apply font size to root for rem scaling
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('scigraph-font-size', fontSize);
  }, [fontSize]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 1, 24)); // Max 24px
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 1, 12)); // Min 12px
  const resetFontSize = () => setFontSize(15);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, fontSize, increaseFontSize, decreaseFontSize, resetFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
