/**
 * EnergyMenuCollapsible.tsx
 * Collapsed-by-default Energy Menu that expands inline.
 * This is a choice, not a prompt.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../constants/theme';
import { EnergyMenuItem, EnergyLevel } from '../models/EnergyMenuItem';
import { getEnergyMenuItemsByLevel } from '../persistence/energyMenuStore';

interface EnergyMenuCollapsibleProps {
  energyMode: EnergyLevel;
  isExpanded: boolean;
  onToggle: () => void;
  onAddItem: (item: EnergyMenuItem) => void;
}

export function EnergyMenuCollapsible({
  energyMode,
  isExpanded,
  onToggle,
  onAddItem,
}: EnergyMenuCollapsibleProps) {
  const theme = useTheme();
  const [menuItems, setMenuItems] = useState<EnergyMenuItem[]>([]);

  useEffect(() => {
    loadMenuItems();
  }, [energyMode]);

  const loadMenuItems = async () => {
    const items = await getEnergyMenuItemsByLevel(energyMode);
    setMenuItems(items);
  };

  // Don't render if no items
  if (menuItems.length === 0) {
    return null;
  }

  const energyLabels = {
    low: { icon: '💤', label: 'Low energy' },
    steady: { icon: '🌱', label: 'Steady' },
    flow: { icon: '✨', label: 'Flow' },
  };

  const { icon, label } = energyLabels[energyMode];

  return (
    <View style={styles.container}>
      {/* Collapsed State (Default) */}
      {!isExpanded ? (
        <TouchableOpacity
          style={[styles.collapsedButton, { backgroundColor: theme.colors.surface }]}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <View style={styles.collapsedContent}>
            <Text style={styles.collapsedIcon}>{icon}</Text>
            <View style={styles.collapsedText}>
              <Text style={[styles.collapsedTitle, { color: theme.colors.text }]}>
                Optional ideas ({label})
              </Text>
              <Text style={[styles.collapsedSubtitle, { color: theme.colors.textSecondary }]}>
                Tap to see
              </Text>
            </View>
          </View>
          <Text style={[styles.expandIcon, { color: theme.colors.textSecondary }]}>▶</Text>
        </TouchableOpacity>
      ) : (
        /* Expanded State */
        <View style={[styles.expandedContainer, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <TouchableOpacity
            style={styles.expandedHeader}
            onPress={onToggle}
            activeOpacity={0.7}
          >
            <View style={styles.collapsedContent}>
              <Text style={styles.collapsedIcon}>{icon}</Text>
              <Text style={[styles.expandedTitle, { color: theme.colors.text }]}>
                Optional ideas ({label})
              </Text>
            </View>
            <Text style={[styles.expandIcon, { color: theme.colors.textSecondary }]}>▼</Text>
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
  // Collapsed state
  collapsedButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  collapsedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collapsedIcon: {
    fontSize: 20,
  },
  collapsedText: {
    gap: 2,
  },
  collapsedTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  collapsedSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  expandIcon: {
    fontSize: 12,
    fontWeight: '600',
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
  expandedTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
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
