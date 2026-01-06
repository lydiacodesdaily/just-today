/**
 * GuideItemCheckbox.tsx
 * Checkbox component for guide checklist items
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GuideItem } from '../models/Guide';
import { useTheme } from '../constants/theme';

interface GuideItemCheckboxProps {
  item: GuideItem;
  onToggle: () => void;
}

export function GuideItemCheckbox({ item, onToggle }: GuideItemCheckboxProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.checked }}
      accessibilityLabel={item.text}
      accessibilityHint={item.checked ? 'Tap to uncheck' : 'Tap to check'}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: item.checked ? theme.colors.success : theme.colors.border,
            backgroundColor: item.checked ? theme.colors.success : 'transparent',
          },
        ]}
      >
        {item.checked && <Feather name="check" size={18} color={theme.colors.surface} />}
      </View>
      <Text
        style={[
          styles.text,
          {
            color: item.checked ? theme.colors.textSecondary : theme.colors.text,
          },
        ]}
      >
        {item.text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 44, // Accessibility: minimum touch target
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
});
