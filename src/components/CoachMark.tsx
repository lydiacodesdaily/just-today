/**
 * CoachMark.tsx
 * Gentle, dismissible hints shown once - never forced or repeated
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../constants/theme';
import { HintId, dismissHint, isHintDismissed } from '../persistence/onboardingStore';

interface CoachMarkProps {
  hintId: HintId;
  message: string;
}

export function CoachMark({ hintId, message }: CoachMarkProps) {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    isHintDismissed(hintId).then((dismissed) => {
      setIsVisible(!dismissed);
    });
  }, [hintId]);

  const handleDismiss = async () => {
    await dismissHint(hintId);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primarySubtle,
          borderColor: theme.colors.primary,
        },
      ]}
    >
      <Text style={[styles.message, { color: theme.colors.text }]}>
        {message}
      </Text>
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={handleDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.dismissText, { color: theme.colors.textSecondary }]}>
          ✕
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 18,
    fontWeight: '400',
  },
});
