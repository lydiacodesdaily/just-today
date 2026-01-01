/**
 * EnergyMenuSheet.tsx
 * Gentle prompt card to add items from Energy Menu to Today.
 * Only shows when conditions are met (has items, hasn't dismissed recently, etc.)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../constants/theme';
import { EnergyMenuItem, EnergyLevel } from '../models/EnergyMenuItem';
import { getEnergyMenuItemsByLevel } from '../persistence/energyMenuStore';
import { useFocus } from '../context/FocusContext';
import { FocusDuration } from '../models/FocusItem';

interface EnergyMenuSheetProps {
  currentEnergyLevel: EnergyLevel;
  onDismiss?: () => void;
}

export function EnergyMenuSheet({ currentEnergyLevel, onDismiss }: EnergyMenuSheetProps) {
  const theme = useTheme();
  const { addToToday, todayItems } = useFocus();
  const [menuItems, setMenuItems] = useState<EnergyMenuItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, [currentEnergyLevel, todayItems]);

  const maxItemsByLevel = { low: 1, steady: 2, flow: 3 };

  const canAddMoreItems = (level: EnergyLevel): boolean => {
    const currentCount = todayItems.filter(item => !item.completedAt).length;
    const maxAllowed = maxItemsByLevel[level];
    return currentCount < maxAllowed;
  };

  const loadMenuItems = async () => {
    const items = await getEnergyMenuItemsByLevel(currentEnergyLevel);
    setMenuItems(items.slice(0, 5)); // Max 5 items
    setIsVisible(items.length > 0 && canAddMoreItems(currentEnergyLevel));
  };

  const handleAddItem = async (item: EnergyMenuItem) => {
    // Convert EstimatedDuration to FocusDuration
    const duration = (item.estimatedDuration || '~15 min') as FocusDuration;

    // Add to Today's Focus
    await addToToday(item.title, duration);

    // Close Energy Menu sheet immediately
    setIsVisible(false);
    onDismiss?.();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || menuItems.length === 0) {
    return null;
  }

  const energyLabels = {
    low: { icon: '💤', label: 'Low Energy' },
    steady: { icon: '🌱', label: 'Steady' },
    flow: { icon: '🔥', label: 'Flow' },
  };

  const { icon, label } = energyLabels[currentEnergyLevel];
  const maxItems = maxItemsByLevel[currentEnergyLevel];
  const currentCount = todayItems.filter(item => !item.completedAt).length;
  const remaining = maxItems - currentCount;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{icon}</Text>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Want to add something from your Energy Menu?
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              You can add {remaining} more {remaining === 1 ? 'item' : 'items'} for {label}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemsContainer}
      >
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.itemCard, { backgroundColor: theme.colors.background }]}
            onPress={() => handleAddItem(item)}
          >
            <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            {item.estimatedDuration && (
              <Text style={[styles.itemDuration, { color: theme.colors.textSecondary }]}>
                {item.estimatedDuration}
              </Text>
            )}
            <View style={[styles.addBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.addBadgeText, { color: theme.colors.background }]}>
                + Add
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 20,
    fontWeight: '300',
  },
  itemsContainer: {
    gap: 12,
    paddingRight: 16,
  },
  itemCard: {
    width: 160,
    padding: 14,
    borderRadius: 12,
    gap: 6,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    minHeight: 40,
  },
  itemDuration: {
    fontSize: 13,
    marginBottom: 4,
  },
  addBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  addBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
