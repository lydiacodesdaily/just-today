/**
 * EnergyPicker.tsx
 * Care / Steady / Flow selector with supportive, neurodivergent-friendly design.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EnergyMode } from '../models/RoutineTemplate';
import { useTheme } from '../constants/theme';

interface EnergyPickerProps {
  selectedMode: EnergyMode;
  onSelect: (mode: EnergyMode) => void;
}

export function EnergyPicker({ selectedMode, onSelect }: EnergyPickerProps) {
  const theme = useTheme();

  const modes: {
    mode: EnergyMode;
    icon: string;
    label: string;
    description: string;
    supportText: string;
    color: string;
    bgColor: string;
  }[] = [
    {
      mode: 'care',
      icon: '🌙',
      label: 'Care',
      description: 'Just the essentials',
      supportText: "It's okay to take it slow",
      color: theme.colors.energyCare,
      bgColor: theme.colors.energyCareSubtle,
    },
    {
      mode: 'steady',
      icon: '🌿',
      label: 'Steady',
      description: 'Your usual pace',
      supportText: 'One step at a time',
      color: theme.colors.energySteady,
      bgColor: theme.colors.energySteadySubtle,
    },
    {
      mode: 'flow',
      icon: '✨',
      label: 'Flow',
      description: 'Feeling good today',
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
        {modes.map(({ mode, icon, label, color, bgColor }) => {
          const isSelected = selectedMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              style={[
                styles.button,
                {
                  backgroundColor: isSelected ? bgColor : theme.colors.surface,
                  borderColor: isSelected ? color : theme.colors.borderSubtle,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => onSelect(mode)}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{icon}</Text>
              <Text
                style={[
                  styles.buttonLabel,
                  {
                    color: isSelected ? color : theme.colors.text,
                    fontWeight: isSelected ? theme.fontWeight.semibold : theme.fontWeight.medium,
                  },
                ]}
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
