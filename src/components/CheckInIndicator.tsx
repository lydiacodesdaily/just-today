/**
 * CheckInIndicator.tsx
 * Small card at the bottom of the Focus tab showing recent check-ins
 * and providing a quick entry point to add a new check-in.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { useCheckIn } from '../context/CheckInContext';
import { CheckInItem } from '../models/CheckInItem';
import { Pace } from '../models/RoutineTemplate';
import { CheckInSheet } from './CheckInSheet';

function getMoodColor(mood: Pace | undefined, theme: any): string {
  switch (mood) {
    case 'low': return theme.colors.energyCare;
    case 'steady': return theme.colors.energySteady;
    case 'flow': return theme.colors.energyFlow;
    default: return theme.colors.border;
  }
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface CheckInIndicatorProps {
  onOpenFirstEntry?: () => void;
}

export function CheckInIndicator({ onOpenFirstEntry }: CheckInIndicatorProps = {}) {
  const theme = useTheme();
  const { todayItems } = useCheckIn();
  const [showSheet, setShowSheet] = useState(false);

  const recentItems = todayItems.slice(-2).reverse();

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderSubtle,
          },
        ]}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={[styles.label, { color: theme.colors.textTertiary }]}>
            CHECK-IN
          </Text>
          <TouchableOpacity
            onPress={() => setShowSheet(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Text style={[styles.addButton, { color: theme.colors.primary }]}>
              + Check in
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent check-ins or empty hint */}
        {recentItems.length === 0 ? (
          <Text style={[styles.emptyHint, { color: theme.colors.textTertiary }]}>
            Check-ins will appear here as you move through your day.
          </Text>
        ) : (
          <View style={styles.itemsList}>
            {recentItems.map((item: CheckInItem) => (
              <View key={item.id} style={styles.item}>
                <View
                  style={[
                    styles.moodDot,
                    {
                      backgroundColor: item.mood
                        ? getMoodColor(item.mood, theme)
                        : 'transparent',
                      borderColor: getMoodColor(item.mood, theme),
                      borderWidth: item.mood ? 0 : 1,
                    },
                  ]}
                />
                <Text
                  style={[styles.itemText, { color: theme.colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.text}
                </Text>
                <Text style={[styles.itemTime, { color: theme.colors.textTertiary }]}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            ))}
            {todayItems.length > 2 && (
              <Text style={[styles.moreHint, { color: theme.colors.textTertiary }]}>
                +{todayItems.length - 2} more — see Reflections
              </Text>
            )}
          </View>
        )}

        {/* Manual first-entry trigger */}
        {onOpenFirstEntry && (
          <View
            style={[
              styles.morningEntryRow,
              { borderTopColor: theme.colors.borderSubtle },
            ]}
          >
            <TouchableOpacity
              onPress={onOpenFirstEntry}
              activeOpacity={0.7}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Text style={[styles.morningEntryText, { color: theme.colors.textTertiary }]}>
                Morning check-in →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <CheckInSheet visible={showSheet} onClose={() => setShowSheet(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  addButton: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  itemsList: {
    gap: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  itemText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  itemTime: {
    fontSize: 11,
    flexShrink: 0,
  },
  moreHint: {
    fontSize: 11,
    marginTop: 2,
  },
  morningEntryRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },
  morningEntryText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
