/**
 * TaskControls.tsx
 * Pause/skip/extend controls for active task.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../constants/theme';

interface TaskControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onExtend: (ms: number) => void;
  onEnd: () => void;
}

export function TaskControls({
  isPaused,
  onPause,
  onResume,
  onSkip,
  onExtend,
  onEnd,
}: TaskControlsProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.primaryControls}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={isPaused ? onResume : onPause}
        >
          <Text style={styles.primaryButtonText}>
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: theme.colors.success },
          ]}
          onPress={onSkip}
        >
          <Text style={styles.primaryButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.extendButtons}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          Extend Time
        </Text>
        <View style={styles.extendRow}>
          <TouchableOpacity
            style={[styles.extendButton, { borderColor: theme.colors.border }]}
            onPress={() => onExtend(60 * 1000)}
          >
            <Text style={[styles.extendButtonText, { color: theme.colors.text }]}>
              +1m
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.extendButton, { borderColor: theme.colors.border }]}
            onPress={() => onExtend(5 * 60 * 1000)}
          >
            <Text style={[styles.extendButtonText, { color: theme.colors.text }]}>
              +5m
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.extendButton, { borderColor: theme.colors.border }]}
            onPress={() => onExtend(10 * 60 * 1000)}
          >
            <Text style={[styles.extendButtonText, { color: theme.colors.text }]}>
              +10m
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.endButton, { borderColor: theme.colors.danger }]}
        onPress={onEnd}
      >
        <Text style={[styles.endButtonText, { color: theme.colors.danger }]}>
          End Routine
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  primaryControls: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  extendButtons: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  extendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  extendButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  extendButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  endButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
