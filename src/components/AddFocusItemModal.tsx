/**
 * AddFocusItemModal.tsx
 * Modal for adding new focus items to Today or Later
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { FocusDuration } from '../models/FocusItem';

interface AddFocusItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, duration: FocusDuration) => void;
  defaultLocation?: 'today' | 'later';
}

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

export function AddFocusItemModal({
  visible,
  onClose,
  onAdd,
  defaultLocation = 'today',
}: AddFocusItemModalProps) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<FocusDuration>('~15 min');

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title.trim(), selectedDuration);
      setTitle('');
      setSelectedDuration('~15 min');
      onClose();
    }
  };

  const handleCancel = () => {
    setTitle('');
    setSelectedDuration('~15 min');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: theme.colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Add to {defaultLocation === 'today' ? 'Today' : 'Later'}
          </Text>
          <TouchableOpacity
            onPress={handleAdd}
            style={styles.addButton}
            disabled={!title.trim()}
          >
            <Text
              style={[
                styles.addText,
                {
                  color: title.trim() ? theme.colors.primary : theme.colors.textSecondary,
                },
              ]}
            >
              Add
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Task name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.borderSubtle,
                },
              ]}
              placeholder="What are you working on today?"
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
          </View>

          {/* Duration Picker */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              About how long will this take?
            </Text>
            <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
              Estimates help you stay realistic.
            </Text>
            <View style={styles.durationGrid}>
              {DURATION_OPTIONS.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationOption,
                    {
                      backgroundColor:
                        selectedDuration === duration
                          ? theme.colors.primarySubtle
                          : theme.colors.surface,
                      borderColor:
                        selectedDuration === duration
                          ? theme.colors.primary
                          : theme.colors.borderSubtle,
                    },
                  ]}
                  onPress={() => setSelectedDuration(duration)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.durationText,
                      {
                        color:
                          selectedDuration === duration
                            ? theme.colors.primary
                            : theme.colors.text,
                        fontWeight: selectedDuration === duration ? '600' : '500',
                      },
                    ]}
                  >
                    {duration}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    paddingVertical: 4,
    paddingLeft: 8,
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    marginBottom: 12,
  },
  input: {
    fontSize: 17,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: 90,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 15,
  },
});
