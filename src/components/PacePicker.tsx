/**
 * PacePicker.tsx
 * Gentle / Steady / Deep pace selector with supportive, neurodivergent-friendly design.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pace } from '../models/RoutineTemplate';
import { useTheme } from '../constants/theme';

interface PacePickerProps {
  selectedPace: Pace;
  onSelect: (pace: Pace) => void;
}

export function PacePicker({ selectedPace, onSelect }: PacePickerProps) {
  const theme = useTheme();

  // Map internal storage keys to user-facing pace labels
  const paces: {
    pace: Pace;
    icon: string;
    label: string;
    description: string;
    supportText: string;
    color: string;
    bgColor: string;
  }[] = [
    {
      pace: 'low',
      icon: '💤',
      label: 'Gentle',
      description: 'For days when you need gentleness',
      supportText: "It's okay to take it slow",
      color: theme.colors.energyCare,
      bgColor: theme.colors.energyCareSubtle,
    },
    {
      pace: 'steady',
      icon: '🌿',
      label: 'Steady',
      description: 'Your usual pace',
      supportText: 'One step at a time',
      color: theme.colors.energySteady,
      bgColor: theme.colors.energySteadySubtle,
    },
    {
      pace: 'flow',
      icon: '✨',
      label: 'Deep',
      description: 'When you have extra capacity',
      supportText: 'Enjoy the momentum',
      color: theme.colors.energyFlow,
      bgColor: theme.colors.energyFlowSubtle,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          How are you feeling today?
        </Text>
      </View>

      <View style={styles.buttons}>
        {paces.map(({ pace, icon, label, description, supportText, color, bgColor }) => {
          const isSelected = selectedPace === pace;
          return (
            <TouchableOpacity
              key={pace}
              style={[
                styles.button,
                {
                  backgroundColor: isSelected ? bgColor : theme.colors.surface,
                  borderColor: isSelected ? color : theme.colors.borderSubtle,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => onSelect(pace)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${label} pace: ${description}. ${supportText}`}
              accessibilityState={{ selected: isSelected }}
              accessibilityHint={`Select ${label} pace`}
            >
              <Text style={styles.icon} accessible={false}>{icon}</Text>
              <Text
                style={[
                  styles.buttonLabel,
                  {
                    color: isSelected ? color : theme.colors.text,
                    fontWeight: isSelected ? theme.fontWeight.semibold : theme.fontWeight.medium,
                  },
                ]}
                accessible={false}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 32,
    marginBottom: 2,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionContainer: {
    paddingHorizontal: 4,
    gap: 6,
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  supportText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
