/**
 * TodaysFocus.tsx
 * Today's Focus section component - displays items for today only
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActionSheetIOS, Platform } from 'react-native';
import { useTheme } from '../constants/theme';
import { useFocus } from '../context/FocusContext';
import { FocusItem, formatCheckOnceDate } from '../models/FocusItem';
import { shouldShowTodayExamples } from '../persistence/onboardingStore';
import { CoachMark } from './CoachMark';
import { CheckOncePicker } from './CheckOncePicker';
import { EditTodayItemModal } from './EditTodayItemModal';
import { SectionLabel } from './SectionLabel';

interface TodaysFocusProps {
  onStartFocus: (item: FocusItem) => void;
  onAddItem: () => void;
}

export function TodaysFocus({ onStartFocus, onAddItem }: TodaysFocusProps) {
  const theme = useTheme();
  const { todayItems, completeItem, moveItemToLater, deleteItem, rolloverCount, dismissRolloverMessage, addToToday, setCheckOnce } = useFocus();
  const [showExamples, setShowExamples] = useState(false);
  const [checkOnceItemId, setCheckOnceItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<FocusItem | null>(null);

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

  // Phase 1 UX redesign: Show all items (no more "Show More" anxiety)

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
          options: ['Cancel', '✏️ Edit...', '▶ Start', '✓ Mark Done', '⏭ Later', '🔄 Check once later...', 'Delete'],
          destructiveButtonIndex: 6,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setEditingItem(item);
          } else if (buttonIndex === 2) {
            onStartFocus(item);
          } else if (buttonIndex === 3) {
            completeItem(item.id);
          } else if (buttonIndex === 4) {
            moveItemToLater(item.id);
          } else if (buttonIndex === 5) {
            setCheckOnceItemId(item.id);
          } else if (buttonIndex === 6) {
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
            text: '✏️ Edit...',
            onPress: () => setEditingItem(item),
          },
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
            text: '🔄 Check once later...',
            onPress: () => setCheckOnceItemId(item.id),
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

  const handleCheckOnceConfirm = (checkOnceDate: string) => {
    if (checkOnceItemId) {
      setCheckOnce(checkOnceItemId, checkOnceDate);
      setCheckOnceItemId(null);
    }
  };

  const renderItem = (item: FocusItem) => {
    return (
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
            {item.checkOnceDate && (
              <Text style={[styles.checkOnceDate, { color: theme.colors.primary }]}>
                • {formatCheckOnceDate(item.checkOnceDate)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.itemActions}>
          <Text style={[styles.itemActionHint, { color: theme.colors.textSecondary }]}>
            Tap for options
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Contextual coach mark */}
      <CoachMark
        hintId="today-coach-mark"
        message="Add 1–3 items. That's enough."
      />

      {/* Section Header - Phase 1: 11px caps label + smaller title */}
      <View style={styles.header}>
        <SectionLabel>Today's Focus</SectionLabel>
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
              + Add a task
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
          {/* Items List - Phase 1: Show all items */}
          {todayItems.map(renderItem)}

          {/* Add Another Button */}
          <TouchableOpacity
            style={[styles.addAnotherButton, { borderColor: theme.colors.borderSubtle }]}
            onPress={onAddItem}
            activeOpacity={0.7}
          >
            <Text style={[styles.addAnotherText, { color: theme.colors.primary }]}>
              + Add to Today
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Check Once Picker Modal */}
      <CheckOncePicker
        visible={checkOnceItemId !== null}
        onConfirm={handleCheckOnceConfirm}
        onCancel={() => setCheckOnceItemId(null)}
      />

      {/* Edit Today Item Modal */}
      {editingItem && (
        <EditTodayItemModal
          item={editingItem}
          visible={true}
          onClose={() => setEditingItem(null)}
        />
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
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemDuration: {
    fontSize: 14,
    fontWeight: '400',
  },
  checkOnceDate: {
    fontSize: 13,
    fontWeight: '500',
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
});
