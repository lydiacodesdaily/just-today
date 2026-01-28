/**
 * DaylineCapture.tsx
 * Dayline section - one-line memory captures throughout the day
 * Past-focused (what happened) vs Brain Dump which is future-focused (what to do)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActionSheetIOS,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { useDayline } from '../context/DaylineContext';
import { DaylineItem } from '../models/DaylineItem';
import { Pace } from '../models/RoutineTemplate';
import { groupByTimeBlock, GroupedDaylineItems } from '../utils/daylineGrouping';
import { SectionLabel } from './SectionLabel';

interface DaylineCaptureProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function DaylineCapture({ isExpanded, onToggle }: DaylineCaptureProps) {
  const theme = useTheme();
  const { todayItems, addItem, updateItem, updateMood, deleteItem } = useDayline();
  const [inputText, setInputText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleAddItem = async () => {
    if (!inputText.trim()) return;
    await addItem(inputText.trim());
    setInputText('');
  };

  const handleStartEdit = (item: DaylineItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEdit = async () => {
    if (editingItemId && editingText.trim()) {
      await updateItem(editingItemId, editingText.trim());
    }
    setEditingItemId(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingText('');
  };

  const getMoodColor = (mood: Pace | undefined): string => {
    switch (mood) {
      case 'low':
        return theme.colors.energyCare;
      case 'steady':
        return theme.colors.energySteady;
      case 'flow':
        return theme.colors.energyFlow;
      default:
        return theme.colors.textTertiary;
    }
  };

  const showMoodPicker = (item: DaylineItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'How did you feel?',
          options: ['Cancel', '● Low', '● Okay', '● Good', '○ Clear'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) updateMood(item.id, 'low');
          else if (buttonIndex === 2) updateMood(item.id, 'steady');
          else if (buttonIndex === 3) updateMood(item.id, 'flow');
          else if (buttonIndex === 4) updateMood(item.id, undefined);
        }
      );
    } else {
      Alert.alert('How did you feel?', undefined, [
        { text: 'Cancel', style: 'cancel' },
        { text: '● Low', onPress: () => updateMood(item.id, 'low') },
        { text: '● Okay', onPress: () => updateMood(item.id, 'steady') },
        { text: '● Good', onPress: () => updateMood(item.id, 'flow') },
        { text: '○ Clear', onPress: () => updateMood(item.id, undefined) },
      ]);
    }
  };

  const handleItemPress = (item: DaylineItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.text,
          options: ['Cancel', '✏️ Edit', '● Mood', 'Delete'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleStartEdit(item);
          else if (buttonIndex === 2) showMoodPicker(item);
          else if (buttonIndex === 3) deleteItem(item.id);
        }
      );
    } else {
      Alert.alert(item.text, 'What would you like to do?', [
        { text: 'Cancel', style: 'cancel' },
        { text: '✏️ Edit', onPress: () => handleStartEdit(item) },
        { text: '● Mood', onPress: () => showMoodPicker(item) },
        { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) },
      ]);
    }
  };

  const groupedItems = groupByTimeBlock(todayItems);

  // Collapsed state
  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedContainer}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.collapsedHeader}>
          <SectionLabel>Dayline</SectionLabel>
          {todayItems.length > 0 && (
            <Text style={[styles.collapsedCount, { color: theme.colors.textTertiary }]}>
              ({todayItems.length})
            </Text>
          )}
        </View>
        <Text style={[styles.expandIcon, { color: theme.colors.textTertiary }]}>▶</Text>
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        {/* Section Header */}
        <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
          <View style={styles.header}>
            <SectionLabel>Dayline</SectionLabel>
          </View>
        </TouchableOpacity>

        {/* Empty State */}
        {todayItems.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Capture your day
            </Text>
            <Text style={[styles.emptyBody, { color: theme.colors.textSecondary }]}>
              One-line notes about what happened.{'\n'}
              Helps you remember without journaling.
            </Text>
            <TextInput
              style={[
                styles.emptyInput,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="What just happened?"
              placeholderTextColor={theme.colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
              blurOnSubmit
            />
          </View>
        ) : (
          <>
            {/* Input Area */}
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="What just happened?"
                placeholderTextColor={theme.colors.textTertiary}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleAddItem}
                returnKeyType="done"
                multiline={false}
                blurOnSubmit
              />
              {inputText.trim() && (
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddItem}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>
                    Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Items grouped by time block */}
            {groupedItems.map((group: GroupedDaylineItems) => (
              <View key={group.timeBlock} style={styles.timeBlockGroup}>
                <Text style={[styles.timeBlockLabel, { color: theme.colors.textTertiary }]}>
                  {group.label}
                </Text>
                <View style={styles.itemsList}>
                  {group.items.map((item) => (
                    <View key={item.id}>
                      {editingItemId === item.id ? (
                        <View
                          style={[
                            styles.item,
                            styles.editingItem,
                            { backgroundColor: theme.colors.surface },
                          ]}
                        >
                          <TextInput
                            style={[
                              styles.editInput,
                              {
                                color: theme.colors.text,
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.primary,
                              },
                            ]}
                            value={editingText}
                            onChangeText={setEditingText}
                            autoFocus
                            multiline
                            onBlur={handleSaveEdit}
                            onSubmitEditing={handleSaveEdit}
                            returnKeyType="done"
                          />
                          <View style={styles.editActions}>
                            <TouchableOpacity
                              style={[styles.editButton, { backgroundColor: theme.colors.border }]}
                              onPress={handleCancelEdit}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.editButtonText,
                                  { color: theme.colors.textSecondary },
                                ]}
                              >
                                Cancel
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
                              onPress={handleSaveEdit}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[styles.editButtonText, { color: theme.colors.surface }]}
                              >
                                Save
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.item, { backgroundColor: theme.colors.surface }]}
                          onPress={() => handleItemPress(item)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.itemContent}>
                            {/* Mood dot */}
                            <View
                              style={[
                                styles.moodDot,
                                {
                                  backgroundColor: item.mood
                                    ? getMoodColor(item.mood)
                                    : 'transparent',
                                  borderColor: item.mood
                                    ? getMoodColor(item.mood)
                                    : theme.colors.border,
                                  borderWidth: item.mood ? 0 : 1,
                                },
                              ]}
                            />
                            <Text
                              style={[styles.itemText, { color: theme.colors.text }]}
                              numberOfLines={2}
                              ellipsizeMode="tail"
                            >
                              {item.text}
                            </Text>
                          </View>
                          <Text style={[styles.tapHint, { color: theme.colors.textTertiary }]}>
                            Tap to edit or add mood
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  collapsedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  collapsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapsedCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 12,
    fontWeight: '500',
  },
  container: {
    gap: 16,
  },
  header: {
    gap: 4,
    paddingHorizontal: 4,
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
  emptyInput: {
    width: '100%',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  timeBlockGroup: {
    gap: 8,
  },
  timeBlockLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  itemsList: {
    gap: 8,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  editingItem: {
    gap: 12,
  },
  editInput: {
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    minHeight: 44,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  moodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6, // Align with first line of text
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  tapHint: {
    fontSize: 11,
    letterSpacing: 0.1,
    marginLeft: 20, // Align with text after dot
  },
});