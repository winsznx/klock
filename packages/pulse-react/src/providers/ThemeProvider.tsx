import React, { createContext, useState } from 'react';
export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState('light');
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>{children}</ThemeContext.Provider>;
};
