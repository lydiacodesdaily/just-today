/**
 * ThemeContext.tsx
 * Manages theme state and provides theme values based on user preference.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useSettings } from './SettingsContext';
import { ThemePreference } from '../models/Settings';

type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { settings, updateSettings } = useSettings();

  const setThemePreference = async (preference: ThemePreference) => {
    await updateSettings({ themePreference: preference });
  };

  // Determine the actual color scheme to use
  const getColorScheme = (): ColorScheme => {
    if (settings.themePreference === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return settings.themePreference;
  };

  const colorScheme = getColorScheme();

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        themePreference: settings.themePreference,
        setThemePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}
