/**
 * SubtaskCreationModal.tsx
 * Modal for creating and managing subtasks when adding tasks > 1 hour
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { Subtask } from '../models/FocusItem';
import {
  generateSubtaskId,
  formatDuration,
  calculateSubtasksTotalTime,
} from '../utils/subtaskHelpers';

interface SubtaskCreationModalProps {
  visible: boolean;
  taskText: string;
  estimatedDurationMs: number;
  suggestions?: Subtask[];
  onSave: (subtasks: Subtask[]) => void;
  onDismiss: () => void;
}

export function SubtaskCreationModal({
  visible,
  taskText,
  estimatedDurationMs,
  suggestions,
  onSave,
  onDismiss,
}: SubtaskCreationModalProps) {
  const theme = useTheme();
  const [subtasks, setSubtasks] = useState<Subtask[]>(suggestions || []);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      const newSubtask: Subtask = {
        id: generateSubtaskId(),
        text: newSubtaskText.trim(),
        order: subtasks.length,
        completed: false,
        estimatedDurationMs: Math.floor(estimatedDurationMs / 4), // Rough estimate
      };
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtaskText('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    const filtered = subtasks.filter(st => st.id !== id);
    // Reorder remaining subtasks
    const reordered = filtered.map((st, index) => ({ ...st, order: index }));
    setSubtasks(reordered);
  };

  const handleSave = () => {
    onSave(subtasks);
  };

  const handleUseSuggestions = () => {
    if (suggestions) {
      setSubtasks(suggestions);
    }
  };

  const totalTime = calculateSubtasksTotalTime(subtasks);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.headerButton, { color: theme.colors.textSecondary }]}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Break It Down
            </Text>
            <TouchableOpacity onPress={handleSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.headerButton, { color: theme.colors.primary }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
            {/* Task info */}
            <View style={styles.taskInfo}>
              <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
                "{taskText}"
              </Text>
              <Text style={[styles.taskDuration, { color: theme.colors.textSecondary }]}>
                Estimated: {formatDuration(estimatedDurationMs)}
              </Text>
            </View>

            {/* Suggestions (if available and not yet used) */}
            {suggestions && suggestions.length > 0 && subtasks.length === 0 && (
              <View style={[styles.suggestionsCard, {
                backgroundColor: theme.colors.primarySubtle,
                borderColor: theme.colors.primary,
              }]}>
                <Text style={[styles.suggestionsTitle, { color: theme.colors.text }]}>
                  Suggested Breakdown
                </Text>
                <Text style={[styles.suggestionsDesc, { color: theme.colors.textSecondary }]}>
                  Based on "{taskText}", here are some typical steps:
                </Text>
                <View style={styles.suggestionsList}>
                  {suggestions.map((st, index) => (
                    <Text key={index} style={[styles.suggestionItem, { color: theme.colors.text }]}>
                      ✓ {st.text}
                    </Text>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.useSuggestionsButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleUseSuggestions}
                >
                  <Text style={styles.useSuggestionsButtonText}>Use These</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Subtasks list */}
            <View style={styles.subtasksSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                What are the steps?
              </Text>

              {subtasks.map((subtask, index) => (
                <View
                  key={subtask.id}
                  style={[
                    styles.subtaskItem,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.subtaskContent}>
                    <Text style={[styles.subtaskNumber, { color: theme.colors.textSecondary }]}>
                      {index + 1}.
                    </Text>
                    <View style={styles.subtaskTextContainer}>
                      <Text style={[styles.subtaskText, { color: theme.colors.text }]}>
                        {subtask.text}
                      </Text>
                      {subtask.estimatedDurationMs && (
                        <Text style={[styles.subtaskDuration, { color: theme.colors.textSecondary }]}>
                          {formatDuration(subtask.estimatedDurationMs)}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveSubtask(subtask.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={[styles.removeButton, { color: theme.colors.textSecondary }]}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Add new subtask */}
              <View style={styles.addSubtaskContainer}>
                <TextInput
                  style={[
                    styles.addSubtaskInput,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Add another step..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={newSubtaskText}
                  onChangeText={setNewSubtaskText}
                  onSubmitEditing={handleAddSubtask}
                  returnKeyType="done"
                />
                {newSubtaskText.trim() && (
                  <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleAddSubtask}
                  >
                    <Text style={styles.addButtonText}>+ Add</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Total time */}
              {subtasks.length > 0 && totalTime > 0 && (
                <Text style={[styles.totalTime, { color: theme.colors.textSecondary }]}>
                  Total: {formatDuration(totalTime)}
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '85%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  taskInfo: {
    marginBottom: 24,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDuration: {
    fontSize: 14,
  },
  suggestionsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionsDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  suggestionsList: {
    gap: 6,
    marginBottom: 16,
  },
  suggestionItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  useSuggestionsButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  useSuggestionsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  subtasksSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtaskItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  subtaskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  subtaskNumber: {
    fontSize: 14,
    fontWeight: '600',
    paddingTop: 2,
  },
  subtaskTextContainer: {
    flex: 1,
  },
  subtaskText: {
    fontSize: 14,
    lineHeight: 20,
  },
  subtaskDuration: {
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    fontSize: 18,
    paddingHorizontal: 4,
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addSubtaskInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  totalTime: {
    fontSize: 14,
    textAlign: 'right',
    marginTop: 4,
  },
});
