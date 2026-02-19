/**
 * CheckInSection.tsx
 * Display-only section for the Reflections tab.
 * Shows today's check-ins grouped by time block (Morning/Afternoon/Evening)
 * with a "+ Check in now" button that opens the CheckInSheet.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../constants/theme';
import { useCheckIn } from '../context/CheckInContext';
import { CheckInItem } from '../models/CheckInItem';
import { Pace } from '../models/RoutineTemplate';
import { groupByTimeBlock, GroupedCheckInItems } from '../utils/checkInGrouping';
import { CheckInSheet } from './CheckInSheet';

function getMoodColor(mood: Pace | undefined, theme: any): string {
  switch (mood) {
    case 'low':
      return theme.colors.energyCare;
    case 'steady':
      return theme.colors.energySteady;
    case 'flow':
      return theme.colors.energyFlow;
    default:
      return theme.colors.border;
  }
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function CheckInSection() {
  const theme = useTheme();
  const { todayItems } = useCheckIn();
  const [showSheet, setShowSheet] = useState(false);

  const groups: GroupedCheckInItems[] = groupByTimeBlock(todayItems);

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            shadowColor: '#000',
          },
        ]}
      >
        {/* Section header */}
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Check-ins
          </Text>
          <TouchableOpacity
            onPress={() => setShowSheet(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Text style={[styles.addButton, { color: theme.colors.primary }]}>
              + Check in now
            </Text>
          </TouchableOpacity>
        </View>

        {groups.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            Check-ins will appear here as you move through your day.
          </Text>
        ) : (
          <View style={styles.groupsList}>
            {groups.map((group) => (
              <View key={group.timeBlock} style={styles.group}>
                <Text
                  style={[
                    styles.groupLabel,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  {group.label.toUpperCase()}
                </Text>
                <View style={styles.itemsList}>
                  {group.items.map((item: CheckInItem) => (
                    <View key={item.id} style={styles.item}>
                      <View
                        style={[
                          styles.moodDot,
                          {
                            backgroundColor: item.mood
                              ? getMoodColor(item.mood, theme)
                              : 'transparent',
                            borderColor: getMoodColor(item.mood, theme),
                            borderWidth: item.mood ? 0 : 1.5,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.itemText,
                          { color: theme.colors.text },
                        ]}
                      >
                        {item.text || (item.mood ? `Feeling ${item.mood}` : '')}
                      </Text>
                      <Text
                        style={[
                          styles.itemTime,
                          { color: theme.colors.textTertiary },
                        ]}
                      >
                        {formatTime(item.createdAt)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <CheckInSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  addButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  groupsList: {
    gap: 16,
  },
  group: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  itemsList: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  itemText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  itemTime: {
    fontSize: 12,
    flexShrink: 0,
    letterSpacing: 0.2,
  },
});
