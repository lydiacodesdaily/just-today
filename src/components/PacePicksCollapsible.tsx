/**
 * PacePicksCollapsible.tsx
 * Collapsed-by-default Extras that expands inline.
 * This is a choice, not a prompt.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../constants/theme';
import { PacePick, PaceTag } from '../models/PacePick';
import { getPacePicksByPace } from '../persistence/pacePicksStore';
import { SectionLabel } from './SectionLabel';

interface PacePicksCollapsibleProps {
  pace: PaceTag;
  isExpanded: boolean;
  onToggle: () => void;
  onAddItem: (item: PacePick) => void;
}

export function PacePicksCollapsible({
  pace,
  isExpanded,
  onToggle,
  onAddItem,
}: PacePicksCollapsibleProps) {
  const theme = useTheme();
  const [menuItems, setMenuItems] = useState<PacePick[]>([]);

  useEffect(() => {
    loadMenuItems();
  }, [pace]);

  const loadMenuItems = async () => {
    const items = await getPacePicksByPace(pace);
    setMenuItems(items);
  };

  // Don't render if no items
  if (menuItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Collapsed State (Default) - Phase 1: reduced prominence */}
      {!isExpanded ? (
        <TouchableOpacity
          style={styles.collapsedButton}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <View style={styles.collapsedContent}>
            <SectionLabel>Optional Ideas</SectionLabel>
            <Text style={[styles.collapsedHint, { color: theme.colors.textTertiary }]}>
              Tap to see
            </Text>
          </View>
          <Text style={[styles.expandIcon, { color: theme.colors.textTertiary }]}>▶</Text>
        </TouchableOpacity>
      ) : (
        /* Expanded State */
        <View style={[styles.expandedContainer, { backgroundColor: theme.colors.surface }]}>
          {/* Header - Phase 1: 11px caps label */}
          <TouchableOpacity
            style={styles.expandedHeader}
            onPress={onToggle}
            activeOpacity={0.7}
          >
            <SectionLabel>Optional Ideas</SectionLabel>
            <Text style={[styles.expandIcon, { color: theme.colors.textTertiary }]}>▼</Text>
          </TouchableOpacity>

          {/* Items List */}
          <View style={styles.itemsList}>
            {menuItems.slice(0, 5).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, { backgroundColor: theme.colors.background }]}
                onPress={() => onAddItem(item)}
                activeOpacity={0.7}
              >
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                  {item.estimatedDuration && (
                    <Text style={[styles.itemDuration, { color: theme.colors.textSecondary }]}>
                      {item.estimatedDuration}
                    </Text>
                  )}
                </View>
                <View style={[styles.addBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.addBadgeText, { color: theme.colors.background }]}>
                    + Add
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Minimal container
  },
  // Collapsed state - Phase 1: reduced prominence
  collapsedButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  collapsedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapsedHint: {
    fontSize: 12,
    fontWeight: '400',
  },
  expandIcon: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Expanded state
  expandedContainer: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemsList: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  itemContent: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  itemDuration: {
    fontSize: 13,
    fontWeight: '400',
  },
  addBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
