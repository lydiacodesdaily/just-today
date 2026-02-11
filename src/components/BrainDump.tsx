/**
 * BrainDump.tsx
 * Brain Dump section component - quick capture for unsorted thoughts
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Animated,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { useBrainDump } from '../context/BrainDumpContext';
import { useFocus } from '../context/FocusContext';
import { BrainDumpItem } from '../models/BrainDumpItem';
import { shouldShowBrainDumpExample } from '../persistence/onboardingStore';
import { CoachMark } from './CoachMark';
import { SectionLabel } from './SectionLabel';

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

  // Capture-time routing state
  const [pendingText, setPendingText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const pendingTextRef = useRef<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Keep ref in sync with state
  pendingTextRef.current = pendingText;

  // Check if we should show example link
  useEffect(() => {
    shouldShowBrainDumpExample().then(setShowExample);
  }, [items.length]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Toast animation
  useEffect(() => {
    if (toastMessage) {
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      toastTimer.current = setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setToastMessage(null));
      }, 2000);
    }
  }, [toastMessage, toastOpacity]);

  const confirmDestination = useCallback(async (destination: 'braindump' | 'today' | 'later') => {
    const textToSave = pendingTextRef.current;
    if (!textToSave) return;

    setPendingText(null);
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }

    if (destination === 'braindump') {
      await addItem(textToSave);
      setToastMessage('Saved to Brain Dump');
    } else if (destination === 'today') {
      await addFromBrainDump(textToSave, 'today');
      setToastMessage('Added to Today');
    } else {
      await addFromBrainDump(textToSave, 'later');
      setToastMessage('Saved for Later');
    }
  }, [addItem, addFromBrainDump]);

  const handleAddItem = () => {
    if (!inputText.trim()) return;

    // If there's already a pending capture, auto-save it to Brain Dump first
    if (pendingTextRef.current) {
      confirmDestination('braindump');
    }

    const text = inputText.trim();
    setPendingText(text);
    pendingTextRef.current = text;
    setInputText('');

    // Start auto-save timer — defaults to Brain Dump after 2.5s
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      confirmDestination('braindump');
    }, 2500);
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
    // Move to Today with default duration
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

  // Phase 1 UX redesign: Collapsed state with reduced prominence
  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedContainer}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.collapsedHeader}>
          <SectionLabel>Brain Dump</SectionLabel>
          {items.length > 0 && (
            <Text style={[styles.collapsedCount, { color: theme.colors.textTertiary }]}>
              ({items.length})
            </Text>
          )}
        </View>
        <Text style={[styles.expandIcon, { color: theme.colors.textTertiary }]}>
          ▶
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

        {/* Section Header - Phase 1: 11px caps label */}
        <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
          <View style={styles.header}>
            <SectionLabel>Brain Dump</SectionLabel>
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
                  backgroundColor: theme.colors.surface,
                  borderColor: pendingText ? theme.colors.textTertiary : theme.colors.border,
                },
                pendingText ? { opacity: 0.5 } : undefined,
              ]}
              placeholder="Dump thoughts here… half-sentences welcome."
              placeholderTextColor={theme.colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
              multiline
              blurOnSubmit
              editable={!pendingText}
            />
            {showExample && !pendingText && (
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
                    backgroundColor: theme.colors.surface,
                    borderColor: pendingText ? theme.colors.textTertiary : theme.colors.border,
                  },
                  pendingText ? { opacity: 0.5 } : undefined,
                ]}
                placeholder="Dump anything on your mind."
                placeholderTextColor={theme.colors.textTertiary}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleAddItem}
                returnKeyType="done"
                multiline={false}
                blurOnSubmit
                editable={!pendingText}
              />
              {inputText.trim() && !pendingText && (
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddItem}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>
                    Save
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* Destination row — shown after submitting text */}
        {pendingText && (
          <View style={[styles.destinationRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.destinationLabel, { color: theme.colors.textSecondary }]}>
              Where should this go?
            </Text>
            <View style={styles.destinationPills}>
              <TouchableOpacity
                style={[styles.destinationPill, styles.destinationPillSelected, { backgroundColor: theme.colors.primary }]}
                onPress={() => confirmDestination('braindump')}
                activeOpacity={0.8}
              >
                <Text style={[styles.destinationPillText, { color: theme.colors.surface }]}>
                  Brain Dump
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.destinationPill, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={() => confirmDestination('today')}
                activeOpacity={0.8}
              >
                <Text style={[styles.destinationPillText, { color: theme.colors.text }]}>
                  Today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.destinationPill, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={() => confirmDestination('later')}
                activeOpacity={0.8}
              >
                <Text style={[styles.destinationPillText, { color: theme.colors.text }]}>
                  Later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Toast */}
        {toastMessage && (
          <Animated.View
            style={[
              styles.toast,
              {
                backgroundColor: theme.colors.successSubtle,
                borderColor: theme.colors.success,
                opacity: toastOpacity,
              },
            ]}
          >
            <Text style={[styles.toastText, { color: theme.colors.text }]}>
              {toastMessage}
            </Text>
          </Animated.View>
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
  destinationRow: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  destinationLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  destinationPills: {
    flexDirection: 'row',
    gap: 8,
  },
  destinationPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  destinationPillSelected: {
    borderWidth: 0,
  },
  destinationPillText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  toast: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
