/**
 * theme.ts
 * Neurodivergent-friendly theme with calm, supportive colors.
 * Designed for reduced cognitive load and sensory comfort.
 */

import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: {
      // Core backgrounds - softer, warmer tones
      background: isDark ? '#1A1A1D' : '#F8F9FA',
      surface: isDark ? '#252529' : '#FFFFFF',
      surfaceSecondary: isDark ? '#2F2F35' : '#F0F2F5',

      // Text - optimized contrast without harshness
      text: isDark ? '#E8E8EA' : '#2C2C2E',
      textSecondary: isDark ? '#A8A8B0' : '#5C5C66',
      textTertiary: isDark ? '#78787F' : '#8E8E93',

      // Borders - subtle and calming
      border: isDark ? '#3A3A3E' : '#DCDCE0',
      borderSubtle: isDark ? '#2A2A2E' : '#EDEDF0',

      // Primary - calming blue
      primary: isDark ? '#6B9FED' : '#5B8FDC',
      primaryLight: isDark ? '#8AB4F1' : '#7BA8E5',
      primarySubtle: isDark ? '#2D4A6B' : '#E8F1FC',

      // Success - gentle, affirming green
      success: isDark ? '#7BC97A' : '#6BB86A',
      successLight: isDark ? '#95D794' : '#88C687',
      successSubtle: isDark ? '#2D4A3A' : '#E8F5E8',

      // Warning - warm, non-alarming
      warning: isDark ? '#E8A968' : '#D89655',
      warningLight: isDark ? '#F0BD85' : '#E5AC75',
      warningSubtle: isDark ? '#4A3A2D' : '#FDF3E8',

      // Danger - present but not aggressive
      danger: isDark ? '#E88585' : '#D67272',
      dangerLight: isDark ? '#F0A0A0' : '#E59090',
      dangerSubtle: isDark ? '#4A2D2D' : '#FCE8E8',

      // Energy mode colors - calm and distinct
      energyCare: isDark ? '#9B8FD8' : '#8B7FCA',
      energySteady: isDark ? '#7DBDA8' : '#6DAD98',
      energyFlow: isDark ? '#E8A968' : '#D89655',

      // Energy mode backgrounds
      energyCareSubtle: isDark ? '#3A3548' : '#F0EDF8',
      energySteadySubtle: isDark ? '#2D4A44' : '#E8F5F2',
      energyFlowSubtle: isDark ? '#4A3A2D' : '#FDF3E8',

      // Supportive UI elements
      overlay: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)',
      shadow: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.08)',

      // Calm accent colors
      calm: isDark ? '#9B8FD8' : '#8B7FCA',
      breathe: isDark ? '#7DBDA8' : '#6DAD98',
      rest: isDark ? '#E8A968' : '#D89655',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    fontSize: {
      xs: 11,
      sm: 13,
      md: 16,
      lg: 20,
      xl: 28,
      xxl: 34,
      xxxl: 42,
    },
    borderRadius: {
      xs: 6,
      sm: 10,
      md: 14,
      lg: 18,
      xl: 24,
      full: 9999,
    },
    // Accessibility-friendly sizes
    touchTarget: {
      min: 44, // iOS minimum recommended
      comfortable: 52,
      spacious: 60,
    },
    // Typography weights
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    // Letter spacing for readability
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      relaxed: 0.3,
      loose: 0.6,
    },
    // Line height for comfort
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
      loose: 2,
    },
  };
};

export type Theme = ReturnType<typeof useTheme>;
