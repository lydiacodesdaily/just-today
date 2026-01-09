/**
 * theme.ts
 * Support-first color palette for Just Today.
 * Designed to feel like being held, not managed.
 * No urgency. No celebration. Just steady support.
 */

export const colors = {
  ink: {
    primary: '#2F3138',
    secondary: '#3A3C43',
    disabled: '#6B6E75',
  },
  sand: {
    background: '#F5F1ED',
    surface: '#FFFFFF',
    border: '#E8E4E0',
  },
  sage: {
    primary: '#6B8570', // Darker for better contrast (4.5:1 against white)
    active: '#879E8E',
    subtle: '#B8C6BC',
  },
  dark: {
    background: '#1E2025',
    surface: '#2A2C31',
    textPrimary: '#E5E2DC',
    textSecondary: '#B8B6B1',
    textDisabled: '#8A8D92',
    sageAccent: '#A7BCAD',
  },
  states: {
    error: '#8C7F76',
  },
};

export const getTheme = (isDark: boolean) => {
  return {
    colors: {
      // Primary backgrounds - warm sand (holding/safety)
      background: isDark ? colors.dark.background : colors.sand.background,
      surface: isDark ? colors.dark.surface : colors.sand.surface,
      surfaceSecondary: isDark ? colors.dark.surface : colors.sand.surface,

      // Text - soft ink (grounding, no urgency)
      text: isDark ? colors.dark.textPrimary : colors.ink.primary,
      textSecondary: isDark ? colors.dark.textSecondary : colors.ink.secondary,
      textTertiary: isDark ? colors.dark.textDisabled : colors.ink.disabled,

      // Borders - subtle sand tones
      border: isDark ? '#3A3A3E' : colors.sand.border,
      borderSubtle: isDark ? '#2A2A2E' : colors.sand.border,

      // Primary accent - muted sage (gentle progress, used sparingly)
      primary: isDark ? colors.dark.sageAccent : colors.sage.primary,
      primaryLight: isDark ? colors.dark.sageAccent : colors.sage.active,
      primarySubtle: isDark ? '#3A3E3B' : colors.sage.subtle,

      // Success - NO bright green, use sage instead
      success: isDark ? colors.dark.sageAccent : colors.sage.primary,
      successLight: isDark ? colors.dark.sageAccent : colors.sage.active,
      successSubtle: isDark ? '#3A3E3B' : colors.sage.subtle,

      // Warning - NO bright colors, use secondary ink instead
      warning: isDark ? colors.dark.textSecondary : colors.ink.disabled,
      warningLight: isDark ? colors.dark.textSecondary : colors.ink.disabled,
      warningSubtle: isDark ? '#2A2C31' : colors.sand.surface,

      // Danger/Error - muted warm grey, informational not punitive
      danger: isDark ? colors.dark.textSecondary : colors.states.error,
      dangerLight: isDark ? colors.dark.textSecondary : colors.states.error,
      dangerSubtle: isDark ? '#2A2C31' : colors.sand.surface,

      // Energy mode colors - distinct, calm, and supportive
      energyCare: isDark ? '#8FA6C8' : '#6B88AB', // Cool blue-grey (restful, gentle)
      energySteady: isDark ? colors.dark.sageAccent : colors.sage.active, // Steady sage green
      energyFlow: isDark ? '#D4B088' : '#C89968', // Warm amber (energizing, not aggressive)

      // Energy mode backgrounds - subtle tinted variations
      energyCareSubtle: isDark ? '#2A2E35' : '#EDF2F7', // Cool grey-blue tint
      energySteadySubtle: isDark ? '#2B2F2D' : '#F3F6F4', // Soft green tint
      energyFlowSubtle: isDark ? '#32302D' : '#FBF5EF', // Warm amber tint

      // Supportive UI elements
      overlay: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)',
      shadow: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.08)',

      // Calm accent colors - using sage family
      calm: isDark ? colors.dark.sageAccent : colors.sage.primary,
      breathe: isDark ? colors.dark.sageAccent : colors.sage.active,
      rest: isDark ? colors.dark.sageAccent : colors.sage.subtle,
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

export type Theme = ReturnType<typeof getTheme>;
