/**
 * LaterList.tsx
 * Later section component - collapsible list for deferred items
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActionSheetIOS, Platform } from 'react-native';
import { useTheme } from '../constants/theme';
import { useFocus } from '../context/FocusContext';
import { FocusItem } from '../models/FocusItem';
import { formatReminderDate } from '../models/FocusItem';

interface LaterListProps {
  onStartFocus: (item: FocusItem) => void;
}

export function LaterList({ onStartFocus }: LaterListProps) {
  const theme = useTheme();
  const { laterItems, moveItemToToday, completeItem, deleteItem, setItemReminder } = useFocus();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleItemPress = (item: FocusItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.title,
          options: [
            'Cancel',
            '↩ Move to Today',
            '▶ Start Now',
            '✓ Mark Done',
            '🔔 Set Reminder',
            'Delete',
          ],
          destructiveButtonIndex: 5,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            moveItemToToday(item.id);
          } else if (buttonIndex === 2) {
            onStartFocus(item);
          } else if (buttonIndex === 3) {
            completeItem(item.id);
          } else if (buttonIndex === 4) {
            showReminderPicker(item);
          } else if (buttonIndex === 5) {
            deleteItem(item.id);
          }
        }
      );
    } else {
      Alert.alert(
        item.title,
        'What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: '↩ Move to Today',
            onPress: () => moveItemToToday(item.id),
          },
          {
            text: '▶ Start Now',
            onPress: () => onStartFocus(item),
          },
          {
            text: '✓ Mark Done',
            onPress: () => completeItem(item.id),
          },
          {
            text: '🔔 Set Reminder',
            onPress: () => showReminderPicker(item),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteItem(item.id),
          },
        ]
      );
    }
  };

  const showReminderPicker = (item: FocusItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Remind me around…',
          options: ['Cancel', 'Tomorrow', 'In a few days', 'Clear reminder'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            // Tomorrow - 9 AM next day
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            setItemReminder(item.id, tomorrow.toISOString());
          } else if (buttonIndex === 2) {
            // In a few days - 9 AM in 3 days
            const fewDays = new Date();
            fewDays.setDate(fewDays.getDate() + 3);
            fewDays.setHours(9, 0, 0, 0);
            setItemReminder(item.id, fewDays.toISOString());
          } else if (buttonIndex === 3) {
            // Clear reminder
            setItemReminder(item.id, undefined);
          }
        }
      );
    } else {
      Alert.alert(
        'Remind me around…',
        'Choose when you would like to be reminded',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Tomorrow',
            onPress: () => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(9, 0, 0, 0);
              setItemReminder(item.id, tomorrow.toISOString());
            },
          },
          {
            text: 'In a few days',
            onPress: () => {
              const fewDays = new Date();
              fewDays.setDate(fewDays.getDate() + 3);
              fewDays.setHours(9, 0, 0, 0);
              setItemReminder(item.id, fewDays.toISOString());
            },
          },
          {
            text: 'Clear reminder',
            style: 'destructive',
            onPress: () => setItemReminder(item.id, undefined),
          },
        ]
      );
    }
  };

  if (laterItems.length === 0) {
    return null; // Don't show Later section if empty
  }

  return (
    <View style={styles.container}>
      {/* Collapsed Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            🕒 Later
          </Text>
          <Text style={[styles.count, { color: theme.colors.textSecondary }]}>
            ({laterItems.length} {laterItems.length === 1 ? 'item' : 'items'})
          </Text>
        </View>
        <Text style={[styles.expandIcon, { color: theme.colors.textSecondary }]}>
          {isExpanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
            Not for today. No rush.
          </Text>

          <View style={styles.itemsList}>
            {laterItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                  <View style={styles.itemMeta}>
                    {item.estimatedDuration && (
                      <Text style={[styles.itemDuration, { color: theme.colors.textSecondary }]}>
                        {item.estimatedDuration}
                      </Text>
                    )}
                    {item.reminderDate && (
                      <Text style={[styles.itemReminder, { color: theme.colors.textSecondary }]}>
                        • Remind {formatReminderDate(item.reminderDate)}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.moveButton, { borderColor: theme.colors.primary }]}
                  onPress={() => moveItemToToday(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.moveButtonText, { color: theme.colors.primary }]}>
                    ↩ Move to Today
                  </Text>
                </TouchableOpacity>
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
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  count: {
    fontSize: 16,
    fontWeight: '400',
  },
  expandIcon: {
    fontSize: 14,
    fontWeight: '600',
  },
  expandedContent: {
    gap: 12,
  },
  helperText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.1,
    marginTop: -4,
  },
  itemsList: {
    gap: 10,
  },
  item: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  itemContent: {
    gap: 6,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemDuration: {
    fontSize: 14,
    fontWeight: '400',
  },
  itemReminder: {
    fontSize: 14,
    fontWeight: '400',
  },
  moveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  moveButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
