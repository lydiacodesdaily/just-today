/**
 * LaterList.tsx
 * Later section component - collapsible list for deferred items
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActionSheetIOS, Platform, Modal } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../constants/theme';
import { useFocus } from '../context/FocusContext';
import { useWeeklyIntent } from '../context/WeeklyIntentContext';
import { FocusItem, TimeBucket, formatTimeBucket, formatCheckOnceDate } from '../models/FocusItem';
import { formatReminderDate } from '../models/FocusItem';
import { shouldShowLaterExamples } from '../persistence/onboardingStore';
import { CoachMark } from './CoachMark';
import { EditLaterItemModal } from './EditLaterItemModal';
import { CheckOncePicker } from './CheckOncePicker';
import { SectionLabel } from './SectionLabel';

interface LaterListProps {
  onStartFocus: (item: FocusItem) => void;
  defaultExpanded?: boolean;
}

export function LaterList({ onStartFocus, defaultExpanded = false }: LaterListProps) {
  const theme = useTheme();
  const { laterItems, moveItemToToday, completeItem, deleteItem, setItemReminder, setItemTimeBucket, addToLater, setCheckOnce } = useFocus();
  const { currentIntent } = useWeeklyIntent();
  const weeklySelectedIds = new Set(
    currentIntent?.items.filter((i) => i.outcome === 'pending').map((i) => i.focusItemId) ?? []
  );
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentItem, setCurrentItem] = useState<FocusItem | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [editingItem, setEditingItem] = useState<FocusItem | null>(null);
  const [checkOnceItemId, setCheckOnceItemId] = useState<string | null>(null);

  // Check if we should show example link
  useEffect(() => {
    shouldShowLaterExamples().then(setShowExamples);
  }, [laterItems.length]);

  const handleAddExamples = async () => {
    await addToLater('Look into appointment options', '~15 min');
    await addToLater('Buy refill / supplies', '~10 min');
    await addToLater('Read or watch something later', '~30 min');
    setShowExamples(false);
  };

  // Memoize the minimum date to prevent creating new Date objects on every render
  const minimumDate = useMemo(() => new Date(), []);

  // Progressive disclosure: Show primary actions first, "More" for secondary
  const handleItemPress = (item: FocusItem) => {
    if (Platform.OS === 'ios') {
      // Primary actions: Move to Today | Start | More...
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.title,
          options: ['Cancel', '↩ Move to Today', '▶ Start', '✓ Mark Done', 'More...'],
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
            text: '↩ Move to Today',
            onPress: () => moveItemToToday(item.id),
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
            text: 'More...',
            onPress: () => showMoreOptions(item),
          },
        ]
      );
    }
  };

  // Secondary actions menu
  const showMoreOptions = (item: FocusItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.title,
          options: [
            'Cancel',
            '✏️ Edit...',
            '🔔 Set Reminder',
            '🗓 When to think about this?',
            '🔄 Check once later...',
            'Delete',
          ],
          destructiveButtonIndex: 5,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setEditingItem(item);
          } else if (buttonIndex === 2) {
            showReminderPicker(item);
          } else if (buttonIndex === 3) {
            showTimeBucketPicker(item);
          } else if (buttonIndex === 4) {
            setCheckOnceItemId(item.id);
          } else if (buttonIndex === 5) {
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
            onPress: () => setEditingItem(item),
          },
          {
            text: '🔔 Set Reminder',
            onPress: () => showReminderPicker(item),
          },
          {
            text: '🗓 When to think about this?',
            onPress: () => showTimeBucketPicker(item),
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

  const showReminderPicker = (item: FocusItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Remind me around…',
          options: ['Cancel', 'Tomorrow', 'In a few days', 'Pick a date…', 'Clear reminder'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 4,
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
            // Pick a date - show date picker
            setCurrentItem(item);
            setSelectedDate(new Date());
            setShowDatePicker(true);
          } else if (buttonIndex === 4) {
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
            text: 'Pick a date…',
            onPress: () => {
              setCurrentItem(item);
              setSelectedDate(new Date());
              setShowDatePicker(true);
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

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && date && currentItem) {
      // Set to 9 AM on the selected date
      const reminderDate = new Date(date);
      reminderDate.setHours(9, 0, 0, 0);
      setItemReminder(currentItem.id, reminderDate.toISOString());

      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
      setCurrentItem(null);
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
      setCurrentItem(null);
    }
  };

  const showTimeBucketPicker = (item: FocusItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'When should I think about this again?',
          message: 'This is just for you — no reminders, no pressure',
          options: [
            'Cancel',
            'Tomorrow',
            'This Weekend',
            'Next Week',
            'Later This Month',
            'Someday',
            'None (clear)',
          ],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 6,
        },
        (buttonIndex) => {
          const buckets: TimeBucket[] = ['TOMORROW', 'THIS_WEEKEND', 'NEXT_WEEK', 'LATER_THIS_MONTH', 'SOMEDAY'];

          if (buttonIndex >= 1 && buttonIndex <= 5) {
            setItemTimeBucket(item.id, buckets[buttonIndex - 1]);
          } else if (buttonIndex === 6) {
            setItemTimeBucket(item.id, 'NONE');
          }
        }
      );
    } else {
      Alert.alert(
        'When should I think about this again?',
        'This is just for you — no reminders, no pressure',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Tomorrow',
            onPress: () => setItemTimeBucket(item.id, 'TOMORROW'),
          },
          {
            text: 'This Weekend',
            onPress: () => setItemTimeBucket(item.id, 'THIS_WEEKEND'),
          },
          {
            text: 'Next Week',
            onPress: () => setItemTimeBucket(item.id, 'NEXT_WEEK'),
          },
          {
            text: 'Later This Month',
            onPress: () => setItemTimeBucket(item.id, 'LATER_THIS_MONTH'),
          },
          {
            text: 'Someday',
            onPress: () => setItemTimeBucket(item.id, 'SOMEDAY'),
          },
          {
            text: 'None (clear)',
            style: 'destructive',
            onPress: () => setItemTimeBucket(item.id, 'NONE'),
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

  // Swipe right = Mark Done
  const renderRightActions = () => (
    <View style={[styles.swipeAction, { backgroundColor: theme.colors.primary }]}>
      <Text style={styles.swipeActionText}>✓ Done</Text>
    </View>
  );

  // Swipe left = Move to Today
  const renderLeftActions = () => (
    <View style={[styles.swipeAction, { backgroundColor: theme.colors.primary, opacity: 0.8 }]}>
      <Text style={styles.swipeActionText}>↩ Today</Text>
    </View>
  );

  const handleSwipeRight = (item: FocusItem) => {
    completeItem(item.id);
  };

  const handleSwipeLeft = (item: FocusItem) => {
    moveItemToToday(item.id);
  };

  const renderItem = (item: FocusItem) => {
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
            <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <View style={styles.itemMeta}>
              {item.estimatedDuration && (
                <Text style={[styles.itemDuration, { color: theme.colors.textSecondary }]}>
                  {item.estimatedDuration}
                </Text>
              )}
              {item.timeBucket && item.timeBucket !== 'NONE' && (
                <Text style={[styles.itemTimeBucket, { color: theme.colors.textSecondary }]}>
                  • {formatTimeBucket(item.timeBucket)}
                </Text>
              )}
              {item.reminderDate && (
                <Text style={[styles.itemReminder, { color: theme.colors.textSecondary }]}>
                  • Remind {formatReminderDate(item.reminderDate)}
                </Text>
              )}
              {item.checkOnceDate && (
                <Text style={[styles.itemCheckOnce, { color: theme.colors.primary }]}>
                  • {formatCheckOnceDate(item.checkOnceDate)}
                </Text>
              )}
              {weeklySelectedIds.has(item.id) && (
                <Text style={[styles.itemCheckOnce, { color: theme.colors.primary }]}>
                  • This week
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
        hintId="later-coach-mark"
        message="Dump it messy. You can sort later — or not."
      />

      {/* Empty State */}
      {laterItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.header}>
            <SectionLabel>Later</SectionLabel>
          </View>

          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Not today — and that's okay
            </Text>
            <Text style={[styles.emptyBody, { color: theme.colors.textSecondary }]}>
              Put things here so they stop nagging you.{'\n'}
              You can decide later.
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                // Open the add modal in 'later' mode
                Alert.prompt(
                  'Add to Later',
                  'What do you want to do later?',
                  (text) => {
                    if (text) addToLater(text, '~15 min');
                  }
                );
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>
                + Add something for later
              </Text>
            </TouchableOpacity>
            {showExamples && (
              <TouchableOpacity
                style={styles.examplesButton}
                onPress={handleAddExamples}
                activeOpacity={0.7}
              >
                <Text style={[styles.examplesButtonText, { color: theme.colors.textSecondary }]}>
                  Add a few examples
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <>
          {/* Collapsed Header - Phase 1: reduced prominence */}
          <TouchableOpacity
            style={styles.header}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.headerContent}>
              <SectionLabel>Later</SectionLabel>
              <Text style={[styles.count, { color: theme.colors.textTertiary }]}>
                ({laterItems.length})
              </Text>
            </View>
            <Text style={[styles.expandIcon, { color: theme.colors.textTertiary }]}>
              {isExpanded ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {/* Expanded Content */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                Not for today. No rush.
              </Text>

              {/* Items List */}
              <View style={styles.listContainer}>
                {laterItems.map(renderItem)}
              </View>
            </View>
          )}
        </>
      )}

      {/* Date Picker Modal for iOS */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => {
            setShowDatePicker(false);
            setCurrentItem(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(false);
                    setCurrentItem(null);
                  }}
                >
                  <Text style={[styles.modalButton, { color: theme.colors.primary }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Pick a date</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (currentItem) {
                      const reminderDate = new Date(selectedDate);
                      reminderDate.setHours(9, 0, 0, 0);
                      setItemReminder(currentItem.id, reminderDate.toISOString());
                      setShowDatePicker(false);
                      setCurrentItem(null);
                    }
                  }}
                >
                  <Text style={[styles.modalButton, styles.modalButtonDone, { color: theme.colors.primary }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={(_event, date) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
                minimumDate={minimumDate}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Date Picker for Android */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
        />
      )}

      {/* Edit Later Item Modal */}
      {editingItem && (
        <EditLaterItemModal
          item={editingItem}
          visible={true}
          onClose={() => setEditingItem(null)}
        />
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
    gap: 12,
  },
  emptyContainer: {
    gap: 16,
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
  count: {
    fontSize: 11,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 12,
    fontWeight: '500',
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
  listContainer: {
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
    flexWrap: 'wrap',
    gap: 8,
  },
  itemDuration: {
    fontSize: 14,
    fontWeight: '400',
  },
  itemTimeBucket: {
    fontSize: 14,
    fontWeight: '400',
  },
  itemReminder: {
    fontSize: 14,
    fontWeight: '400',
  },
  itemCheckOnce: {
    fontSize: 13,
    fontWeight: '500',
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
  itemActions: {
    marginTop: 8,
  },
  itemActionHint: {
    fontSize: 13,
    fontWeight: '400',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalButton: {
    fontSize: 17,
    fontWeight: '400',
  },
  modalButtonDone: {
    fontWeight: '600',
  },
});
