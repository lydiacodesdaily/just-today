/**
 * GuideCard.tsx
 * Card component for displaying a guide in the list view
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Guide } from '../models/Guide';
import { useTheme } from '../constants/theme';

interface GuideCardProps {
  guide: Guide;
  onPress: () => void;
}

export function GuideCard({ guide, onPress }: GuideCardProps) {
  const theme = useTheme();

  const itemCount = guide.items.length;
  const itemText = itemCount === 1 ? 'item' : 'items';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{guide.title}</Text>
          {!guide.isDefault && (
            <View style={[styles.badge, { backgroundColor: theme.colors.surfaceSecondary }]}>
              <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>Custom</Text>
            </View>
          )}
        </View>
        <Text style={[styles.itemCount, { color: theme.colors.textSecondary }]}>
          {itemCount} {itemText}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 72,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  itemCount: {
    fontSize: 14,
    lineHeight: 20,
  },
});
