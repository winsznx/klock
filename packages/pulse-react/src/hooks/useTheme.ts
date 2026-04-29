import { useContext } from 'react';
import { ThemeContext } from '../providers/ThemeProvider.js';
export const useTheme = () => useContext(ThemeContext);
