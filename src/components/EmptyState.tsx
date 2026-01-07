/**
 * EmptyState.tsx
 * Thoughtful empty states that teach without overwhelming
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../constants/theme';

interface EmptyStateProps {
  title: string;
  body: string;
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  icon?: string;
}

export function EmptyState({
  title,
  body,
  primaryAction,
  secondaryAction,
  icon,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderSubtle,
        },
      ]}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}

      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </Text>

      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
        {body}
      </Text>

      {primaryAction && (
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={primaryAction.onPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryButtonText, { color: theme.colors.surface }]}>
            {primaryAction.label}
          </Text>
        </TouchableOpacity>
      )}

      {secondaryAction && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={secondaryAction.onPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>
            {secondaryAction.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  body: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    minWidth: 200,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
