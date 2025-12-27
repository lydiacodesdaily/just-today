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
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Choose what feels right for you right now
        </Text>
      </View>

      <View style={styles.buttons}>
        {modes.map(({ mode, icon, label, description, supportText, color, bgColor }) => {
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
                  minHeight: theme.touchTarget.comfortable,
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
              <Text
                style={[
                  styles.buttonDescription,
                  {
                    color: theme.colors.textSecondary,
                    lineHeight: theme.lineHeight.relaxed,
                  },
                ]}
              >
                {description}
              </Text>
              {isSelected && (
                <Text
                  style={[
                    styles.supportText,
                    {
                      color: color,
                      lineHeight: theme.lineHeight.relaxed,
                    },
                  ]}
                >
                  {supportText}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 28,
    marginBottom: 4,
  },
  buttonLabel: {
    fontSize: 16,
  },
  buttonDescription: {
    fontSize: 13,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
