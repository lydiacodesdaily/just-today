/**
 * EnergyPicker.tsx
 * Care / Steady / Flow selector component.
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

  const modes: { mode: EnergyMode; label: string; description: string }[] = [
    { mode: 'care', label: 'Care', description: 'Gentle essentials' },
    { mode: 'steady', label: 'Steady', description: 'Normal routine' },
    { mode: 'flow', label: 'Flow', description: 'Full energy' },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Today's Energy
      </Text>
      <View style={styles.buttons}>
        {modes.map(({ mode, label, description }) => {
          const isSelected = selectedMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              style={[
                styles.button,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => onSelect(mode)}
            >
              <Text
                style={[
                  styles.buttonLabel,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {label}
              </Text>
              <Text
                style={[
                  styles.buttonDescription,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {description}
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
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 12,
  },
});
