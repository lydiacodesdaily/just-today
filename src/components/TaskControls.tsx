/**
 * TaskControls.tsx
 * Simplified, calm controls with reduced decision fatigue.
 */

import React, { useState } from 'react';
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
  const [showExtendOptions, setShowExtendOptions] = useState(false);

  const handleExtend = (ms: number) => {
    onExtend(ms);
    setShowExtendOptions(false);
  };

  return (
    <View style={styles.container}>
      {/* Primary action - always visible, large target */}
      <View style={styles.primarySection}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: isPaused
                ? theme.colors.primarySubtle
                : theme.colors.surface,
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={isPaused ? onResume : onPause}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.primaryButtonText,
              { color: theme.colors.primary },
            ]}
          >
            {isPaused ? '▶ Continue' : '⏸ Pause'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Secondary actions - grouped and less prominent */}
      <View style={styles.secondarySection}>
        {!showExtendOptions ? (
          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: theme.colors.successSubtle,
                  borderColor: theme.colors.success,
                },
              ]}
              onPress={onSkip}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.success }]}>
                Done with this →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setShowExtendOptions(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                Need more time
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.extendSection}>
            <Text style={[styles.extendLabel, { color: theme.colors.textSecondary }]}>
              Add more time
            </Text>
            <View style={styles.extendRow}>
              <TouchableOpacity
                style={[
                  styles.extendButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => handleExtend(60 * 1000)}
              >
                <Text style={[styles.extendButtonText, { color: theme.colors.text }]}>
                  +1 min
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.extendButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => handleExtend(5 * 60 * 1000)}
              >
                <Text style={[styles.extendButtonText, { color: theme.colors.text }]}>
                  +5 min
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.extendButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => handleExtend(10 * 60 * 1000)}
              >
                <Text style={[styles.extendButtonText, { color: theme.colors.text }]}>
                  +10 min
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.cancelExtend}
              onPress={() => setShowExtendOptions(false)}
            >
              <Text style={[styles.cancelExtendText, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    gap: 8,
  },
  primaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  secondarySection: {
    gap: 12,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  extendSection: {
    gap: 12,
    paddingVertical: 8,
  },
  extendLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  extendRow: {
    flexDirection: 'row',
    gap: 10,
  },
  extendButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  extendButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cancelExtend: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelExtendText: {
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
