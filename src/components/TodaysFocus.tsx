/**
 * TodaysFocus.tsx
 * Today's Focus section component - displays items for today only
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActionSheetIOS, Platform } from 'react-native';
import { useTheme } from '../constants/theme';
import { useFocus } from '../context/FocusContext';
import { FocusItem } from '../models/FocusItem';
import { shouldShowTodayExamples } from '../persistence/onboardingStore';
import { CoachMark } from './CoachMark';

interface TodaysFocusProps {
  onStartFocus: (item: FocusItem) => void;
  onAddItem: () => void;
}

export function TodaysFocus({ onStartFocus, onAddItem }: TodaysFocusProps) {
  const theme = useTheme();
  const { todayItems, completeItem, moveItemToLater, deleteItem, rolloverCount, dismissRolloverMessage, addToToday } = useFocus();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  // Check if we should show example link
  useEffect(() => {
    shouldShowTodayExamples().then(setShowExamples);
  }, [todayItems.length]);

  const handleAddExamples = async () => {
    await addToToday('Reply to one message', '~5 min');
    await addToToday('10-minute tidy', '~10 min');
    await addToToday('Pick one thing for tomorrow', '~5 min');
    setShowExamples(false);
  };

  // Show up to 3 items by default
  const VISIBLE_ITEMS_LIMIT = 3;
  const hasMoreItems = todayItems.length > VISIBLE_ITEMS_LIMIT;
  const visibleItems = isExpanded ? todayItems : todayItems.slice(0, VISIBLE_ITEMS_LIMIT);
  const hiddenCount = todayItems.length - VISIBLE_ITEMS_LIMIT;

  // Show rollover message if items were moved from yesterday
  React.useEffect(() => {
    if (rolloverCount > 0) {
      // Non-modal, calm system message
      setTimeout(() => {
        Alert.alert(
          '',
          `A few unfinished items were moved to Later.`,
          [
            {
              text: 'OK',
              onPress: () => dismissRolloverMessage(),
            },
          ],
          { cancelable: true }
        );
      }, 500);
    }
  }, [rolloverCount, dismissRolloverMessage]);

  const handleItemPress = (item: FocusItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.title,
          options: ['Cancel', '▶ Start', '✓ Mark Done', '⏭ Later', 'Delete'],
          destructiveButtonIndex: 4,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            onStartFocus(item);
          } else if (buttonIndex === 2) {
            completeItem(item.id);
          } else if (buttonIndex === 3) {
            moveItemToLater(item.id);
          } else if (buttonIndex === 4) {
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
            text: '▶ Start',
            onPress: () => onStartFocus(item),
          },
          {
            text: '✓ Mark Done',
            onPress: () => completeItem(item.id),
          },
          {
            text: '⏭ Later',
            onPress: () => moveItemToLater(item.id),
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

  return (
    <View style={styles.container}>
      {/* Contextual coach mark */}
      <CoachMark
        hintId="today-coach-mark"
        message="Add 1–3 items. That's enough."
      />

      {/* Section Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Today's Focus
        </Text>
      </View>

      {/* Empty State */}
      {todayItems.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            What's one thing for today?
          </Text>
          <Text style={[styles.emptyBody, { color: theme.colors.textSecondary }]}>
            You don't need a full list.{'\n'}
            One small, doable thing is enough.
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={onAddItem}
            activeOpacity={0.8}
          >
            <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>
              ➕ Add a task
            </Text>
          </TouchableOpacity>
          {showExamples && (
            <TouchableOpacity
              style={styles.examplesButton}
              onPress={handleAddExamples}
              activeOpacity={0.7}
            >
              <Text style={[styles.examplesButtonText, { color: theme.colors.textSecondary }]}>
                Add 3 examples
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.itemsList}>
          {/* Items List */}
          {visibleItems.map((item) => (
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
                {item.estimatedDuration && (
                  <Text style={[styles.itemDuration, { color: theme.colors.textSecondary }]}>
                    {item.estimatedDuration}
                  </Text>
                )}
              </View>
              <View style={styles.itemActions}>
                <Text style={[styles.itemActionHint, { color: theme.colors.textSecondary }]}>
                  Tap for options
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Expand/Collapse affordance */}
          {hasMoreItems && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setIsExpanded(!isExpanded)}
              activeOpacity={0.7}
            >
              <Text style={[styles.expandText, { color: theme.colors.textSecondary }]}>
                {isExpanded ? 'Show less' : `+ ${hiddenCount} more (optional)`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Add Another Button */}
          <TouchableOpacity
            style={[styles.addAnotherButton, { borderColor: theme.colors.borderSubtle }]}
            onPress={onAddItem}
            activeOpacity={0.7}
          >
            <Text style={[styles.addAnotherText, { color: theme.colors.primary }]}>
              ＋ Add to Today
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  helperText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  emptyState: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  emptyBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  addButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  examplesButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  examplesButtonText: {
    fontSize: 15,
    textAlign: 'center',
  },
  itemsList: {
    gap: 10,
  },
  item: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
  },
  itemDuration: {
    fontSize: 14,
    fontWeight: '400',
  },
  itemActions: {
    marginLeft: 12,
  },
  itemActionHint: {
    fontSize: 13,
    fontWeight: '400',
  },
  addAnotherButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 6,
  },
  addAnotherText: {
    fontSize: 15,
    fontWeight: '600',
  },
  expandButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  expandText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
