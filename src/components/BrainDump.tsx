/**
 * BrainDump.tsx
 * Brain Dump section component - quick capture for unsorted thoughts
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActionSheetIOS,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { useBrainDump } from '../context/BrainDumpContext';
import { useFocus } from '../context/FocusContext';
import { BrainDumpItem } from '../models/BrainDumpItem';
import { shouldShowBrainDumpExample } from '../persistence/onboardingStore';
import { CoachMark } from './CoachMark';

interface BrainDumpProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function BrainDump({ isExpanded, onToggle }: BrainDumpProps) {
  const theme = useTheme();
  const { items, addItem, updateItem, keepItem, deleteItem } = useBrainDump();
  const { addFromBrainDump } = useFocus();
  const [inputText, setInputText] = useState('');
  const [showExample, setShowExample] = useState(false);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Check if we should show example link
  useEffect(() => {
    shouldShowBrainDumpExample().then(setShowExample);
  }, [items.length]);

  const handleAddItem = async () => {
    if (!inputText.trim()) return;

    await addItem(inputText.trim());
    setInputText('');
  };

  const handleStartEdit = (item: BrainDumpItem) => {
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

  const handleItemPress = (item: BrainDumpItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.text,
          options: ['Cancel', '✏️ Edit', '↗️ Move to Today', '🧷 Move to Later', 'Delete'],
          destructiveButtonIndex: 4,
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            handleStartEdit(item);
          } else if (buttonIndex === 2) {
            await handleMoveToToday(item);
          } else if (buttonIndex === 3) {
            await handleMoveToLater(item);
          } else if (buttonIndex === 4) {
            deleteItem(item.id);
          }
        }
      );
    } else {
      Alert.alert(
        item.text,
        'What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: '✏️ Edit',
            onPress: () => handleStartEdit(item),
          },
          {
            text: '↗️ Move to Today',
            onPress: () => handleMoveToToday(item),
          },
          {
            text: '🧷 Move to Later',
            onPress: () => handleMoveToLater(item),
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

  const handleMoveToToday = async (item: BrainDumpItem) => {
    // Move to Today's Focus with default duration
    await addFromBrainDump(item.text, 'today');
    // Remove from brain dump
    await deleteItem(item.id);
  };

  const handleMoveToLater = async (item: BrainDumpItem) => {
    // Move to Later list with default duration
    await addFromBrainDump(item.text, 'later');
    // Remove from brain dump (using keepItem to mark as processed)
    await keepItem(item.id);
  };

  // Display only the last 3 items
  const recentItems = items.slice(-3).reverse();

  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={[styles.collapsedContainer, { backgroundColor: theme.colors.surface }]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={[styles.collapsedTitle, { color: theme.colors.text }]}>
          🧠 Brain Dump
        </Text>
        <Text style={[styles.collapsedHint, { color: theme.colors.textSecondary }]}>
          Tap to capture thoughts
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        {/* Contextual coach mark */}
        <CoachMark
          hintId="brain-dump-coach-mark"
          message="Dump it messy. You can sort later — or not."
        />

        {/* Section Header */}
        <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Brain Dump
            </Text>
          </View>
        </TouchableOpacity>

        {/* Empty State */}
        {items.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Get it out of your head
            </Text>
            <Text style={[styles.emptyBody, { color: theme.colors.textSecondary }]}>
              This doesn't need to be organized or useful.{'\n'}
              Messy is fine.
            </Text>
            <TextInput
              style={[
                styles.emptyInput,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Dump thoughts here… half-sentences welcome."
              placeholderTextColor={theme.colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
              multiline
              blurOnSubmit
            />
            {showExample && (
              <TouchableOpacity
                style={styles.exampleButton}
                onPress={() => setShowExampleModal(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.exampleButtonText, { color: theme.colors.textSecondary }]}>
                  See an example
                </Text>
              </TouchableOpacity>
            )}
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
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Dump anything on your mind."
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
          </>
        )}

        {/* Recent Items List (max 3) */}
        {recentItems.length > 0 && (
          <View style={styles.itemsList}>
            {recentItems.map((item) => (
              <View key={item.id}>
                {editingItemId === item.id ? (
                  <View style={[styles.item, styles.editingItem, { backgroundColor: theme.colors.surface }]}>
                    <TextInput
                      style={[
                        styles.editInput,
                        {
                          color: theme.colors.text,
                          backgroundColor: theme.colors.background,
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
                        <Text style={[styles.editButtonText, { color: theme.colors.textSecondary }]}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSaveEdit}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.editButtonText, { color: theme.colors.surface }]}>
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
                    <Text
                      style={[styles.itemText, { color: theme.colors.text }]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.text}
                    </Text>
                    <Text style={[styles.keepHint, { color: theme.colors.textTertiary }]}>
                      Tap to keep or discard
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {items.length > 3 && (
          <Text style={[styles.moreItemsHint, { color: theme.colors.textTertiary }]}>
            +{items.length - 3} more thought{items.length - 3 !== 1 ? 's' : ''}
          </Text>
        )}

        {/* Example Modal */}
        <Modal
          visible={showExampleModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowExampleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Example brain dump
              </Text>
              <Text style={[styles.modalExample, { color: theme.colors.textSecondary }]}>
                "Need to email Sam{'\n'}
                why am I tired{'\n'}
                groceries{'\n'}
                remember passport{'\n'}
                anxious about Thursday{'\n'}
                idea for routine app"
              </Text>
              <Text style={[styles.modalNote, { color: theme.colors.textTertiary }]}>
                This is just an example — nothing here will be saved.
              </Text>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowExampleModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.surface }]}>
                  Got it
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  collapsedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 4,
  },
  collapsedTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  collapsedHint: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  container: {
    gap: 16,
  },
  header: {
    gap: 4,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  helperText: {
    fontSize: 13,
    letterSpacing: 0.1,
    lineHeight: 18,
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  exampleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  exampleButtonText: {
    fontSize: 15,
    textAlign: 'center',
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
  itemText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  keepHint: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  moreItemsHint: {
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.1,
    paddingVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalExample: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  modalNote: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
