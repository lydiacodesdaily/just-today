/**
 * DailyEnergyGate.tsx
 * Full-screen entry view shown once per day for energy selection.
 *
 * Designed to feel like a calm doorway into the day.
 * No pressure, no gamification, no guilt.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../constants/theme';
import { useEnergy } from '../context/EnergyContext';
import { EnergyMode } from '../models/RoutineTemplate';

const ENERGY_OPTIONS: Array<{
  mode: EnergyMode;
  icon: string;
  label: string;
  description: string;
}> = [
  {
    mode: 'low',
    icon: '💤',
    label: 'Low',
    description: "It's okay to take it slow",
  },
  {
    mode: 'steady',
    icon: '🌿',
    label: 'Steady',
    description: 'One step at a time',
  },
  {
    mode: 'flow',
    icon: '✨',
    label: 'Flow',
    description: 'Enjoy the momentum',
  },
];

export function DailyEnergyGate() {
  const theme = useTheme();
  const { setEnergyForToday, skipEnergySelection } = useEnergy();

  const handleSelectEnergy = async (mode: EnergyMode) => {
    await setEnergyForToday(mode);
  };

  const handleSkip = async () => {
    await skipEnergySelection();
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
            How's your energy right now?
          </Text>
        </View>

        {/* Energy Options */}
        <View style={styles.options}>
          {ENERGY_OPTIONS.map(({ mode, icon, label, description }) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.optionButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSubtle,
                },
              ]}
              onPress={() => handleSelectEnergy(mode)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Select ${label} energy: ${description}`}
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
          accessibilityLabel="Skip energy selection for now"
        >
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
            I'll share later
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
