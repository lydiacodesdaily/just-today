/**
 * SectionLabel.tsx
 * Consistent 11px uppercase section label for visual hierarchy
 * Part of Phase 1 UX redesign - increases contrast between section labels and item titles
 */

import React from 'react';
import { Text, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../constants/theme';

interface SectionLabelProps {
  children: string;
  style?: ViewStyle;
}

export function SectionLabel({ children, style }: SectionLabelProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: theme.colors.textTertiary }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
