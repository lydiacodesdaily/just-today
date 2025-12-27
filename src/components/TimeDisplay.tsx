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
  /** Total planned duration in milliseconds (optional, for progress indicator) */
  totalDurationMs?: number;
  /** Original planned duration before any extensions */
  originalDurationMs?: number;
}

export function TimeDisplay({ timeRemaining, totalDurationMs, originalDurationMs }: TimeDisplayProps) {
  const theme = useTheme();

  if (!timeRemaining) {
    return null;
  }

  const overtimeMessages = [
    'It\'s okay to take your time',
    'No rush, keep going',
    'You\'re doing great',
    'Take all the time you need',
    'This is your routine, your pace',
    'Doing it is what matters',
  ];

  const getOvertimeMessage = () => {
    const minutes = Math.floor(timeRemaining.overtimeMs / 60000);
    // Rotate every 2 minutes instead of 5
    return overtimeMessages[Math.min(Math.floor(minutes / 2), overtimeMessages.length - 1)];
  };

  // Calculate progress text if totalDurationMs is provided
  const getProgressText = () => {
    if (!totalDurationMs || timeRemaining.isOvertime) return null;

    const elapsedMs = totalDurationMs - timeRemaining.remainingMs;
    const elapsedMinutes = Math.ceil(elapsedMs / 60000);
    const totalMinutes = Math.ceil(totalDurationMs / 60000);

    return `${elapsedMinutes} of ${totalMinutes} min`;
  };

  // Calculate total actual time spent (for when extensions have been added)
  const getTotalTimeText = () => {
    if (!originalDurationMs) return null;

    const totalElapsedMinutes = Math.ceil(timeRemaining.elapsedMs / 60000);
    const originalMinutes = Math.ceil(originalDurationMs / 60000);

    // Only show if we've gone beyond the original duration (either by extension or overtime)
    if (totalElapsedMinutes <= originalMinutes) return null;

    return `Total: ${totalElapsedMinutes} min`;
  };

  const progressText = getProgressText();
  const totalTimeText = getTotalTimeText();

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
      {progressText && (
        <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
          {progressText}
        </Text>
      )}
      {totalTimeText && (
        <Text style={[styles.totalTimeText, { color: theme.colors.textSecondary }]}>
          {totalTimeText}
        </Text>
      )}
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
  progressText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: -4,
  },
  totalTimeText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: -8,
    opacity: 0.7,
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
