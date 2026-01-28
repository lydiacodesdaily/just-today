/**
 * PacePromptBanner.tsx
 * A gentle, dismissible banner prompting pace selection.
 *
 * Shows at the top of the home screen when user hasn't selected pace for today.
 * Non-blocking - users can dismiss and set pace later via PaceIndicator.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../constants/theme';
import { usePace } from '../context/PaceContext';
import { Pace } from '../models/RoutineTemplate';

const PACE_OPTIONS: Array<{
  mode: Pace;
  icon: string;
  label: string;
}> = [
  { mode: 'low', icon: '💤', label: 'Gentle' },
  { mode: 'steady', icon: '🌿', label: 'Steady' },
  { mode: 'flow', icon: '✨', label: 'Deep' },
];

export function PacePromptBanner() {
  const theme = useTheme();
  const { setPaceForToday, skipPaceSelection } = usePace();

  const handleSelectPace = async (mode: Pace) => {
    await setPaceForToday(mode);
  };

  const handleDismiss = async () => {
    // Dismiss sets steady as default and marks as selected
    await skipPaceSelection();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primarySubtle,
          borderColor: theme.colors.primary,
        },
      ]}
    >
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleDismiss}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Dismiss pace prompt"
      >
        <Text style={[styles.closeIcon, { color: theme.colors.textSecondary }]}>
          ✕
        </Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          What pace feels right today?
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          You can change this anytime
        </Text>
      </View>

      {/* Pace Options - horizontal layout */}
      <View style={styles.options}>
        {PACE_OPTIONS.map(({ mode, icon, label }) => (
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
            accessibilityLabel={`Select ${label} pace`}
          >
            <Text style={styles.optionIcon}>{icon}</Text>
            <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    paddingTop: 12,
    marginBottom: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 4,
  },
  closeIcon: {
    fontSize: 18,
    lineHeight: 18,
  },
  header: {
    marginBottom: 16,
    paddingRight: 24, // Space for close button
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  options: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
