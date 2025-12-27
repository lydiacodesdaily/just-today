/**
 * TaskControls.tsx
 * Simplified, calm controls with reduced decision fatigue.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { useTheme } from '../constants/theme';

interface TaskControlsProps {
  isPaused: boolean;
  isAutoAdvance: boolean;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onExtend: (ms: number) => void;
  onEnd: () => void;
  onToggleAutoAdvance: () => void;
}

export function TaskControls({
  isPaused,
  isAutoAdvance,
  onPause,
  onResume,
  onComplete,
  onSkip,
  onExtend,
  onEnd,
  onToggleAutoAdvance,
}: TaskControlsProps) {
  const theme = useTheme();

  const handleComplete = () => {
    // Gentle haptic feedback on task completion
    Vibration.vibrate(50);
    onComplete();
  };

  return (
    <View style={styles.container}>
      {/* Primary actions - when ready to move on */}
      <View style={styles.primarySection}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          When you're ready to move on:
        </Text>
        <View style={styles.primaryRow}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={handleComplete}
            activeOpacity={0.7}
          >
            <Text style={[styles.primaryButtonIcon, { color: theme.colors.surface }]}>✓</Text>
            <Text style={[styles.primaryButtonText, { color: theme.colors.surface }]}>
              Done
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={onSkip}
            activeOpacity={0.7}
          >
            <Text style={[styles.primaryButtonIcon, { color: theme.colors.text }]}>⏭</Text>
            <Text style={[styles.primaryButtonText, { color: theme.colors.text }]}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Secondary actions - adjust current task */}
      <View style={styles.secondarySection}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.pauseButton,
              {
                backgroundColor: isPaused
                  ? theme.colors.primarySubtle
                  : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={isPaused ? onResume : onPause}
            activeOpacity={0.7}
          >
            <Text style={[styles.pauseButtonText, { color: theme.colors.text }]}>
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.autoAdvanceButton,
              {
                backgroundColor: isAutoAdvance
                  ? theme.colors.primarySubtle
                  : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={onToggleAutoAdvance}
            activeOpacity={0.7}
          >
            <Text style={[styles.autoAdvanceButtonText, { color: theme.colors.text }]}>
              {isAutoAdvance ? '⏭️ Auto' : '⏭️ Manual'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeAdjustRow}>
          <TouchableOpacity
            style={[
              styles.timeButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => onExtend(-5 * 60 * 1000)}
            activeOpacity={0.7}
          >
            <Text style={[styles.timeButtonText, { color: theme.colors.text }]}>
              -5m
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.timeButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => onExtend(-1 * 60 * 1000)}
            activeOpacity={0.7}
          >
            <Text style={[styles.timeButtonText, { color: theme.colors.text }]}>
              -1m
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.timeButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => onExtend(1 * 60 * 1000)}
            activeOpacity={0.7}
          >
            <Text style={[styles.timeButtonText, { color: theme.colors.text }]}>
              +1m
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.timeButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => onExtend(5 * 60 * 1000)}
            activeOpacity={0.7}
          >
            <Text style={[styles.timeButtonText, { color: theme.colors.text }]}>
              +5m
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tertiary action - minimal, tucked away */}
      <TouchableOpacity
        style={styles.endButton}
        onPress={onEnd}
        activeOpacity={0.7}
      >
        <Text style={[styles.endButtonText, { color: theme.colors.textTertiary }]}>
          End routine
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 20,
  },
  primarySection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  primaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    gap: 6,
  },
  primaryButtonIcon: {
    fontSize: 24,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  secondarySection: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pauseButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  pauseButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  autoAdvanceButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  autoAdvanceButtonText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  timeAdjustRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  endButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  endButtonText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'lowercase',
  },
});
