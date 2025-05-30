import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Theme } from '../types/chamber';
import { ThemeType, ThemeMode } from '../types/chamber';

// Theme definitions
export const themes: Record<ThemeType, Theme> = {
  [ThemeType.DARK_SLATE]: {
    id: ThemeType.DARK_SLATE,
    name: 'Professional Dark',
    description: 'Classic dark theme for medical equipment',
    mode: ThemeMode.DARK,
    colors: {
      primary: '#0f172a',      // slate-900
      secondary: '#1e293b',    // slate-800
      tertiary: '#334155',     // slate-700
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8', // slate-400
      textAccent: '#60a5fa',   // blue-400
      border: '#475569',       // slate-600
      borderLight: '#64748b',  // slate-500
      success: '#22c55e',      // green-500
      warning: '#f59e0b',      // amber-500
      danger: '#ef4444',       // red-500
      info: '#3b82f6',         // blue-500
      brand: '#60a5fa'         // blue-400
    }
  },
  
  [ThemeType.DARK_BLUE]: {
    id: ThemeType.DARK_BLUE,
    name: 'Medical Blue',
    description: 'Deep blue theme inspired by medical devices',
    mode: ThemeMode.DARK,
    colors: {
      primary: '#0c1e3d',      // Deep navy
      secondary: '#1e3a5f',    // Navy blue
      tertiary: '#2563eb',     // blue-600
      textPrimary: '#ffffff',
      textSecondary: '#93c5fd', // blue-300
      textAccent: '#60a5fa',   // blue-400
      border: '#1d4ed8',       // blue-700
      borderLight: '#2563eb',  // blue-600
      success: '#10b981',      // emerald-500
      warning: '#f59e0b',      // amber-500
      danger: '#ef4444',       // red-500
      info: '#06b6d4',         // cyan-500
      brand: '#3b82f6'         // blue-500
    }
  },
  
  [ThemeType.DARK_PURPLE]: {
    id: ThemeType.DARK_PURPLE,
    name: 'Cosmic Purple',
    description: 'Deep purple theme with cosmic vibes',
    mode: ThemeMode.DARK,
    colors: {
      primary: '#1e1b4b',      // indigo-900
      secondary: '#312e81',    // indigo-800
      tertiary: '#4c1d95',     // violet-800
      textPrimary: '#ffffff',
      textSecondary: '#c4b5fd', // violet-300
      textAccent: '#a855f7',   // purple-500
      border: '#6d28d9',       // violet-700
      borderLight: '#7c3aed',  // violet-600
      success: '#22c55e',      // green-500
      warning: '#f59e0b',      // amber-500
      danger: '#ef4444',       // red-500
      info: '#8b5cf6',         // violet-500
      brand: '#a855f7'         // purple-500
    }
  },
  
  [ThemeType.DARK_APPLE]: {
    id: ThemeType.DARK_APPLE,
    name: 'Apple Dark',
    description: 'Apple\'s dark mode with sophisticated styling',
    mode: ThemeMode.DARK,
    colors: {
      primary: '#000000',      // Apple pure black
      secondary: '#1c1c1e',    // Apple dark gray
      tertiary: '#2c2c2e',     // Apple medium gray
      textPrimary: '#ffffff',  // Apple white
      textSecondary: '#8e8e93', // Apple secondary text
      textAccent: '#0a84ff',   // Apple blue (dark mode)
      border: '#38383a',       // Apple border gray
      borderLight: '#48484a',  // Apple lighter border
      success: '#30d158',      // Apple green
      warning: '#ff9f0a',      // Apple orange
      danger: '#ff453a',       // Apple red (dark mode)
      info: '#0a84ff',         // Apple blue (dark mode)
      brand: '#0a84ff'         // Apple blue (dark mode)
    }
  },
  
  [ThemeType.LIGHT_CLEAN]: {
    id: ThemeType.LIGHT_CLEAN,
    name: 'Clean White',
    description: 'Minimal light theme for bright environments',
    mode: ThemeMode.LIGHT,
    colors: {
      primary: '#ffffff',      // white
      secondary: '#f8fafc',    // slate-50
      tertiary: '#e2e8f0',     // slate-200
      textPrimary: '#0f172a',  // slate-900
      textSecondary: '#475569', // slate-600
      textAccent: '#2563eb',   // blue-600
      border: '#cbd5e1',       // slate-300
      borderLight: '#e2e8f0',  // slate-200
      success: '#059669',      // emerald-600
      warning: '#d97706',      // amber-600
      danger: '#dc2626',       // red-600
      info: '#2563eb',         // blue-600
      brand: '#2563eb'         // blue-600
    }
  },
  
  [ThemeType.LIGHT_WARM]: {
    id: ThemeType.LIGHT_WARM,
    name: 'Warm Cream',
    description: 'Soft warm theme reducing eye strain',
    mode: ThemeMode.LIGHT,
    colors: {
      primary: '#fefce8',      // yellow-50
      secondary: '#fef3c7',    // amber-100
      tertiary: '#f3e8ff',     // violet-50
      textPrimary: '#1f2937',  // gray-800
      textSecondary: '#6b7280', // gray-500
      textAccent: '#7c3aed',   // violet-600
      border: '#d1d5db',       // gray-300
      borderLight: '#e5e7eb',  // gray-200
      success: '#059669',      // emerald-600
      warning: '#d97706',      // amber-600
      danger: '#dc2626',       // red-600
      info: '#7c3aed',         // violet-600
      brand: '#7c3aed'         // violet-600
    }
  },
  
  [ThemeType.LIGHT_BLUE]: {
    id: ThemeType.LIGHT_BLUE,
    name: 'Sky Blue',
    description: 'Fresh light blue theme with clean aesthetics',
    mode: ThemeMode.LIGHT,
    colors: {
      primary: '#f0f9ff',      // sky-50
      secondary: '#e0f2fe',    // sky-100
      tertiary: '#bae6fd',     // sky-200
      textPrimary: '#0c4a6e',  // sky-900
      textSecondary: '#0369a1', // sky-700
      textAccent: '#0284c7',   // sky-600
      border: '#7dd3fc',       // sky-300
      borderLight: '#a5f3fc',  // cyan-200
      success: '#059669',      // emerald-600
      warning: '#d97706',      // amber-600
      danger: '#dc2626',       // red-600
      info: '#0284c7',         // sky-600
      brand: '#0ea5e9'         // sky-500
    }
  },
  
  [ThemeType.LIGHT_APPLE]: {
    id: ThemeType.LIGHT_APPLE,
    name: 'Apple',
    description: 'Clean, minimal design inspired by Apple',
    mode: ThemeMode.LIGHT,
    colors: {
      primary: '#fafafa',      // Soft white
      secondary: '#ffffff',    // Pure white
      tertiary: '#f5f5f7',     // Apple gray
      textPrimary: '#1d1d1f',  // Apple black
      textSecondary: '#86868b', // Apple gray text
      textAccent: '#007aff',   // Apple blue
      border: '#e5e5e7',       // Light border
      borderLight: '#f5f5f7',  // Lighter border
      success: '#30d158',      // Apple green
      warning: '#ff9f0a',      // Apple orange
      danger: '#ff3b30',       // Apple red
      info: '#007aff',         // Apple blue
      brand: '#007aff'         // Apple blue
    }
  }
};

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeType: ThemeType) => void;
  themes: Record<ThemeType, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentThemeType, setCurrentThemeType] = useState<ThemeType>(ThemeType.DARK_SLATE);

  const setTheme = (themeType: ThemeType) => {
    setCurrentThemeType(themeType);
    // Store in localStorage for persistence
    localStorage.setItem('elixir-theme', themeType);
  };

  // Load theme from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('elixir-theme') as ThemeType;
    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeType(savedTheme);
    }
  }, []);

  const value = {
    currentTheme: themes[currentThemeType],
    setTheme,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 