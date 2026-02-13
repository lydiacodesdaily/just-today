/**
 * TodaysFocus.tsx
 * Today section component - displays items for today only
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActionSheetIOS, Platform } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTheme } from '../constants/theme';
import { useFocus } from '../context/FocusContext';
import { FocusItem, FocusDuration, formatCheckOnceDate } from '../models/FocusItem';
import { shouldShowTodayExamples } from '../persistence/onboardingStore';
import { CoachMark } from './CoachMark';
import { CheckOncePicker } from './CheckOncePicker';
import { SectionLabel } from './SectionLabel';

const DURATION_OPTIONS: FocusDuration[] = [
  '~5 min',
  '~10 min',
  '~15 min',
  '~25 min',
  '~30 min',
  '~45 min',
  '~1 hour',
  '~2 hours',
];

interface TodaysFocusProps {
  onStartFocus: (item: FocusItem) => void;
  onAddItem: () => void;
}

export function TodaysFocus({ onStartFocus, onAddItem }: TodaysFocusProps) {
  const theme = useTheme();
  const { todayItems, completeItem, moveItemToLater, deleteItem, rolloverCount, dismissRolloverMessage, addToToday, setCheckOnce, updateTodayItem } = useFocus();
  const [showExamples, setShowExamples] = useState(false);
  const [checkOnceItemId, setCheckOnceItemId] = useState<string | null>(null);

  // Inline editing state
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditTitle, setInlineEditTitle] = useState('');
  const [inlineEditDuration, setInlineEditDuration] = useState<FocusDuration | null>(null);

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

  // Progressive disclosure: Show primary actions first, "More" for secondary
  const handleItemPress = (item: FocusItem) => {
    if (Platform.OS === 'ios') {
      // Primary actions: Start | Mark Done | More...
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.title,
          options: ['Cancel', '▶ Start', '✓ Mark Done', 'More...'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            onStartFocus(item);
          } else if (buttonIndex === 2) {
            completeItem(item.id);
          } else if (buttonIndex === 3) {
            showMoreOptions(item);
          }
        }
      );
    } else {
      // Android: Primary actions
      Alert.alert(
        item.title,
        'Choose an action:',
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
            text: 'More...',
            onPress: () => showMoreOptions(item),
          },
        ]
      );
    }
  };

  // Secondary actions menu
  const showMoreOptions = (item: FocusItem) => {
    const startInlineEdit = () => {
      setInlineEditingId(item.id);
      setInlineEditTitle(item.title);
      setInlineEditDuration(null);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.title,
          options: ['Cancel', '✏️ Edit...', '⏭ Later', '🔄 Circle back later...', 'Delete'],
          destructiveButtonIndex: 4,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            startInlineEdit();
          } else if (buttonIndex === 2) {
            moveItemToLater(item.id);
          } else if (buttonIndex === 3) {
            setCheckOnceItemId(item.id);
          } else if (buttonIndex === 4) {
            deleteItem(item.id);
          }
        }
      );
    } else {
      Alert.alert(
        item.title,
        'More options:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: '✏️ Edit...',
            onPress: startInlineEdit,
          },
          {
            text: '⏭ Later',
            onPress: () => moveItemToLater(item.id),
          },
          {
            text: '🔄 Circle back later...',
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

  // Swipe right = Mark Done
  const renderRightActions = () => (
    <View style={[styles.swipeAction, { backgroundColor: theme.colors.primary }]}>
      <Text style={styles.swipeActionText}>✓ Done</Text>
    </View>
  );

  // Swipe left = Move to Later
  const renderLeftActions = () => (
    <View style={[styles.swipeAction, { backgroundColor: theme.colors.textSecondary }]}>
      <Text style={styles.swipeActionText}>⏭ Later</Text>
    </View>
  );

  const handleSwipeRight = (item: FocusItem) => {
    completeItem(item.id);
  };

  const handleSwipeLeft = (item: FocusItem) => {
    moveItemToLater(item.id);
  };

  const handleCheckOnceConfirm = (checkOnceDate: string) => {
    if (checkOnceItemId) {
      setCheckOnce(checkOnceItemId, checkOnceDate);
      setCheckOnceItemId(null);
    }
  };

  const handleInlineSave = async (itemId: string) => {
    const trimmed = inlineEditTitle.trim();
    if (trimmed) {
      const item = todayItems.find((i) => i.id === itemId);
      const finalDuration = inlineEditDuration ?? item?.estimatedDuration ?? '~15 min';
      await updateTodayItem(itemId, trimmed, finalDuration);
    }
    setInlineEditingId(null);
  };

  const renderItem = (item: FocusItem) => {
    const isEditing = inlineEditingId === item.id;
    const activeDuration = inlineEditDuration ?? item.estimatedDuration;

    if (isEditing) {
      return (
        <View key={item.id} style={[styles.item, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.itemContent}>
            <TextInput
              style={[styles.itemTitle, styles.inlineEditInput, { color: theme.colors.text }]}
              value={inlineEditTitle}
              onChangeText={setInlineEditTitle}
              autoFocus
              onBlur={() => handleInlineSave(item.id)}
              onSubmitEditing={() => handleInlineSave(item.id)}
              returnKeyType="done"
              selectTextOnFocus
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.durationChipRow}
              contentContainerStyle={styles.durationChipRowContent}
              keyboardShouldPersistTaps="always"
            >
              {DURATION_OPTIONS.map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.durationChip,
                    {
                      backgroundColor: activeDuration === dur
                        ? theme.colors.primarySubtle
                        : theme.colors.surface,
                      borderColor: activeDuration === dur
                        ? theme.colors.primary
                        : theme.colors.borderSubtle,
                    },
                  ]}
                  onPress={() => setInlineEditDuration(dur)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.durationChipText,
                      {
                        color: activeDuration === dur
                          ? theme.colors.primary
                          : theme.colors.text,
                        fontWeight: activeDuration === dur ? '600' : '400',
                      },
                    ]}
                  >
                    {dur}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      );
    }

    return (
      <Swipeable
        key={item.id}
        renderRightActions={() => renderRightActions()}
        renderLeftActions={() => renderLeftActions()}
        onSwipeableOpen={(direction) => {
          if (direction === 'right') {
            handleSwipeRight(item);
          } else if (direction === 'left') {
            handleSwipeLeft(item);
          }
        }}
        overshootRight={false}
        overshootLeft={false}
      >
        <TouchableOpacity
          style={[styles.item, { backgroundColor: theme.colors.surface }]}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.itemContent}>
            <TouchableOpacity
              onPress={() => {
                setInlineEditingId(item.id);
                setInlineEditTitle(item.title);
                setInlineEditDuration(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                {item.title}
              </Text>
            </TouchableOpacity>
            <View style={styles.itemMeta}>
              <TouchableOpacity
                onPress={() => {
                  setInlineEditingId(item.id);
                  setInlineEditTitle(item.title);
                  setInlineEditDuration(null);
                }}
                activeOpacity={0.7}
              >
                {item.estimatedDuration && (
                  <Text style={[styles.itemDuration, { color: theme.colors.textSecondary }]}>
                    {item.estimatedDuration}
                  </Text>
                )}
              </TouchableOpacity>
              {item.checkOnceDate && (
                <Text style={[styles.checkOnceDate, { color: theme.colors.primary }]}>
                  • {formatCheckOnceDate(item.checkOnceDate)}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.itemActions}>
            <Text style={[styles.itemActionHint, { color: theme.colors.textSecondary }]}>
              Tap or swipe
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
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
        <SectionLabel>Today</SectionLabel>
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
  inlineEditInput: {
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  durationChipRow: {
    marginTop: 8,
  },
  durationChipRowContent: {
    gap: 6,
    paddingRight: 8,
  },
  durationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  durationChipText: {
    fontSize: 13,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginVertical: 0,
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
