/**
 * FirstEntrySheet.tsx
 * Daily first-entry check-in modal. Appears once per day as a calm
 * nervous-system reset entry point — not productivity-oriented.
 *
 * Two internal states:
 *  - 'input'    : free-form text + emotion chip selection
 *  - 'response' : calm validation message (only shown for heavy emotional tone)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { useDailyEntry } from '../context/DailyEntryContext';
import { DailyEmotion } from '../models/DailyEntry';

interface FirstEntrySheetProps {
  visible: boolean;
  onClose: () => void;
}

type SheetState = 'input' | 'response';
type EmotionalTone = 'heavy' | 'light';

const EMOTION_CHIPS: { label: string; value: DailyEmotion }[] = [
  { label: 'Anxious', value: 'anxious' },
  { label: 'Tired', value: 'tired' },
  { label: 'Overwhelmed', value: 'overwhelmed' },
  { label: 'Stuck', value: 'stuck' },
  { label: 'Good', value: 'good' },
  { label: 'Neutral', value: 'neutral' },
];

const HEAVY_EMOTIONS: DailyEmotion[] = ['anxious', 'tired', 'overwhelmed', 'stuck'];

const HEAVY_KEYWORDS = [
  'anxious', 'tired', 'overwhelmed', 'stuck', 'hard', 'difficult',
  'stressed', 'exhausted', 'panic', 'terrible', 'awful', 'heavy',
  "can't", 'cannot', 'struggling', 'rough',
];

const HEAVY_RESPONSES = [
  "That sounds like a heavy morning.\nLet's make today smaller.",
  "Sounds like a lot to carry.\nYou don't have to do it all today.",
  "It's okay to start slow.\nEven tiny steps count.",
];

function detectTone(text: string, emotion?: DailyEmotion): EmotionalTone {
  if (emotion && HEAVY_EMOTIONS.includes(emotion)) return 'heavy';
  if (text && HEAVY_KEYWORDS.some((w) => text.toLowerCase().includes(w))) {
    return 'heavy';
  }
  return 'light';
}

function pickResponse(dateKey: string): string {
  // Deterministic per day so the same message shows within a session
  const index = dateKey.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return HEAVY_RESPONSES[index % HEAVY_RESPONSES.length];
}

export function FirstEntrySheet({ visible, onClose }: FirstEntrySheetProps) {
  const theme = useTheme();
  const { saveEntry, dismissForToday } = useDailyEntry();

  const [sheetState, setSheetState] = useState<SheetState>('input');
  const [selectedEmotion, setSelectedEmotion] = useState<DailyEmotion | undefined>(undefined);
  const [text, setText] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSave = async () => {
    await saveEntry(text.trim(), selectedEmotion);

    const tone = detectTone(text, selectedEmotion);
    if (tone === 'heavy') {
      const today = new Date().toISOString().split('T')[0];
      setResponseMessage(pickResponse(today));
      setSheetState('response');
    } else {
      handleClose();
    }
  };

  const handleSkip = async () => {
    await dismissForToday();
    handleClose();
  };

  const handleClose = () => {
    setSheetState('input');
    setSelectedEmotion(undefined);
    setText('');
    setResponseMessage('');
    onClose();
  };

  const toggleEmotion = (emotion: DailyEmotion) => {
    setSelectedEmotion((prev) => (prev === emotion ? undefined : emotion));
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleSkip}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.background, shadowColor: theme.colors.text },
          ]}
        >
          {sheetState === 'input' ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Title */}
              <Text style={[styles.title, { color: theme.colors.text }]}>
                What's going on right now?
              </Text>
              <Text style={[styles.subtext, { color: theme.colors.textSecondary }]}>
                You don't have to plan yet. Just get it out.
              </Text>

              {/* Text input */}
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                placeholder="What's on your mind..."
                placeholderTextColor={theme.colors.textTertiary}
                value={text}
                onChangeText={setText}
                multiline
                autoFocus
                textAlignVertical="top"
                returnKeyType="default"
              />

              {/* Emotion chips */}
              <View style={styles.chipsContainer}>
                {EMOTION_CHIPS.map((chip) => {
                  const isSelected = selectedEmotion === chip.value;
                  return (
                    <TouchableOpacity
                      key={chip.value}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.surface,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                        },
                      ]}
                      onPress={() => toggleEmotion(chip.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipLabel,
                          {
                            color: isSelected
                              ? theme.colors.surface
                              : theme.colors.text,
                          },
                        ]}
                      >
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.saveButtonText, { color: theme.colors.surface }]}>
                    Save and Continue
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSkip}
                  activeOpacity={0.7}
                  style={styles.skipButton}
                >
                  <Text style={[styles.skipText, { color: theme.colors.textTertiary }]}>
                    Skip for now
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            /* Response screen */
            <View style={styles.responseContainer}>
              <Text style={[styles.responseMessage, { color: theme.colors.text }]}>
                {responseMessage}
              </Text>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={[styles.saveButtonText, { color: theme.colors.surface }]}>
                  Pick one tiny thing
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.7}
                style={styles.skipButton}
              >
                <Text style={[styles.skipText, { color: theme.colors.textTertiary }]}>
                  Just sit for a minute
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 20,
    padding: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  textInput: {
    fontSize: 15,
    lineHeight: 22,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 96,
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    gap: 12,
    alignItems: 'center',
  },
  saveButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  responseContainer: {
    gap: 20,
    alignItems: 'center',
    paddingVertical: 8,
  },
  responseMessage: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
});
