/**
 * TimeDisplay.tsx
 * Timer display with gentle, encouraging overtime messaging.
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

  const overtimeMessages = [
    'It\'s okay to take your time',
    'No rush, keep going',
    'You\'re doing great',
  ];

  const getOvertimeMessage = () => {
    const minutes = Math.floor(timeRemaining.overtimeMs / 60000);
    return overtimeMessages[Math.min(Math.floor(minutes / 5), overtimeMessages.length - 1)];
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.time,
          {
            color: timeRemaining.isOvertime
              ? theme.colors.warning
              : theme.colors.primary,
          },
        ]}
      >
        {formatTimeRemaining(timeRemaining)}
      </Text>
      {timeRemaining.isOvertime && (
        <View style={styles.overtimeContainer}>
          <Text style={[styles.overtimeLabel, { color: theme.colors.warning }]}>
            Extra time
          </Text>
          <Text style={[styles.supportMessage, { color: theme.colors.textSecondary }]}>
            {getOvertimeMessage()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  time: {
    fontSize: 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  overtimeContainer: {
    alignItems: 'center',
    gap: 6,
  },
  overtimeLabel: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  supportMessage: {
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
  },
});
