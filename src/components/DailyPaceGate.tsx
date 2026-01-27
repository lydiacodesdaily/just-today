/**
 * DailyPaceGate.tsx
 * Full-screen entry view shown once per day for pace selection.
 *
 * Designed to feel like a calm doorway into the day.
 * No pressure, no gamification, no guilt.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../constants/theme';
import { usePace } from '../context/PaceContext';
import { Pace } from '../models/RoutineTemplate';

// Map internal storage keys to user-facing pace labels
const PACE_OPTIONS: Array<{
  mode: Pace;
  icon: string;
  label: string;
  description: string;
}> = [
  {
    mode: 'low',
    icon: '💤',
    label: 'Gentle',
    description: 'For days when you need gentleness',
  },
  {
    mode: 'steady',
    icon: '🌿',
    label: 'Steady',
    description: 'Your usual pace',
  },
  {
    mode: 'flow',
    icon: '✨',
    label: 'Deep',
    description: 'When you have extra capacity',
  },
];

export function DailyPaceGate() {
  const theme = useTheme();
  const { setPaceForToday, skipPaceSelection } = usePace();

  const handleSelectPace = async (mode: Pace) => {
    await setPaceForToday(mode);
  };

  const handleSkip = async () => {
    await skipPaceSelection();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Before we begin, take a breath.{'\n'}
            What pace feels right today?
          </Text>
        </View>

        {/* Pace Options */}
        <View style={styles.options}>
          {PACE_OPTIONS.map(({ mode, icon, label, description }) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.optionButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSubtle,
                },
              ]}
              onPress={() => handleSelectPace(mode)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Select ${label} pace: ${description}`}
            >
              <Text style={styles.optionIcon}>{icon}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {label}
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                  {description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Skip Option */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Skip pace selection for now"
        >
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
            I'll share later
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Alias for backwards compatibility
export const DailyEnergyGate = DailyPaceGate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  options: {
    gap: 12,
    marginBottom: 40,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  optionIcon: {
    fontSize: 32,
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 15,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
