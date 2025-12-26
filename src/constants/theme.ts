/**
 * theme.ts
 * Simple dark mode theme constants.
 */

import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: {
      background: isDark ? '#000000' : '#FFFFFF',
      surface: isDark ? '#1C1C1E' : '#F2F2F7',
      surfaceSecondary: isDark ? '#2C2C2E' : '#E5E5EA',
      text: isDark ? '#FFFFFF' : '#000000',
      textSecondary: isDark ? '#8E8E93' : '#3C3C43',
      border: isDark ? '#38383A' : '#C6C6C8',
      primary: isDark ? '#0A84FF' : '#007AFF',
      danger: isDark ? '#FF453A' : '#FF3B30',
      success: isDark ? '#32D74B' : '#34C759',
      warning: isDark ? '#FF9F0A' : '#FF9500',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    fontSize: {
      sm: 12,
      md: 16,
      lg: 20,
      xl: 28,
      xxl: 34,
    },
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
    },
  };
};

export type Theme = ReturnType<typeof useTheme>;
