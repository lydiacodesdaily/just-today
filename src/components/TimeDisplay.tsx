/**
 * TimeDisplay.tsx
 * Timer display with overtime indicator.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimeRemaining, formatTimeRemaining } from '../engine/timerEngine';
import { useTheme } from '../constants/theme';

interface TimeDisplayProps {
  timeRemaining: TimeRemaining | null;
}

export function TimeDisplay({ timeRemaining }: TimeDisplayProps) {
  const theme = useTheme();

  if (!timeRemaining) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.time,
          {
            color: timeRemaining.isOvertime
              ? theme.colors.warning
              : theme.colors.text,
          },
        ]}
      >
        {formatTimeRemaining(timeRemaining)}
      </Text>
      {timeRemaining.isOvertime && (
        <Text style={[styles.label, { color: theme.colors.warning }]}>
          Overtime
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  time: {
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
});
