/**
 * CheckInSheet.tsx
 * Bottom sheet for capturing a check-in moment.
 * Used both manually (from CheckInIndicator) and after routine completion.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { useCheckIn } from '../context/CheckInContext';
import { Pace } from '../models/RoutineTemplate';

interface CheckInSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Optional title override, e.g. "How did that go?" after routine completion */
  title?: string;
}

const MOOD_OPTIONS: { label: string; value: Pace; emoji: string }[] = [
  { label: 'Low', value: 'low', emoji: '🌙' },
  { label: 'Okay', value: 'steady', emoji: '🌤' },
  { label: 'Flow', value: 'flow', emoji: '☀️' },
];

export function CheckInSheet({
  visible,
  onClose,
  title = "How's it going?",
}: CheckInSheetProps) {
  const theme = useTheme();
  const { addItem } = useCheckIn();
  const [selectedMood, setSelectedMood] = useState<Pace | undefined>(undefined);
  const [noteText, setNoteText] = useState('');

  const handleSave = async () => {
    await addItem(noteText.trim(), selectedMood);
    handleClose();
  };

  const handleClose = () => {
    setSelectedMood(undefined);
    setNoteText('');
    onClose();
  };

  const canSave = selectedMood !== undefined || noteText.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          {/* Handle bar */}
          <View
            style={[styles.handle, { backgroundColor: theme.colors.border }]}
          />

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>

          {/* Mood selector */}
          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.moodPill,
                  {
                    backgroundColor:
                      selectedMood === option.value
                        ? theme.colors.primary
                        : theme.colors.background,
                    borderColor:
                      selectedMood === option.value
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
                onPress={() =>
                  setSelectedMood(
                    selectedMood === option.value ? undefined : option.value
                  )
                }
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    {
                      color:
                        selectedMood === option.value
                          ? theme.colors.surface
                          : theme.colors.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Optional note */}
          <TextInput
            style={[
              styles.noteInput,
              {
                color: theme.colors.text,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
              },
            ]}
            placeholder="Add a note... (optional)"
            placeholderTextColor={theme.colors.textTertiary}
            value={noteText}
            onChangeText={setNoteText}
            returnKeyType="done"
            submitBehavior="blurAndSubmit"
          />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              style={styles.skipButton}
            >
              <Text
                style={[styles.skipText, { color: theme.colors.textTertiary }]}
              >
                Skip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: canSave
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
              onPress={handleSave}
              disabled={!canSave}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.saveText,
                  {
                    color: canSave
                      ? theme.colors.surface
                      : theme.colors.textTertiary,
                  },
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  moodPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  moodEmoji: {
    fontSize: 18,
  },
  moodLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  noteInput: {
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
