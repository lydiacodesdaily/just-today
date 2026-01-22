/**
 * CaptureScreen.tsx
 * Capture Mode - calm, low-pressure thought offloading screen
 * Shown when user has no committed items for today
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActionSheetIOS,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { useBrainDump } from '../context/BrainDumpContext';
import { useFocus } from '../context/FocusContext';
import { BrainDumpItem } from '../models/BrainDumpItem';

interface CaptureScreenProps {
  onPickItem: () => void;
  onStartRoutine: () => void;
}

export function CaptureScreen({ onPickItem, onStartRoutine }: CaptureScreenProps) {
  const theme = useTheme();
  const { items, addItem, deleteItem } = useBrainDump();
  const { addFromBrainDump } = useFocus();
  const [inputText, setInputText] = useState('');

  // Display only the last 3 items (most recent first)
  const recentItems = items.slice(-3).reverse();

  const handleAddCapture = async () => {
    if (!inputText.trim()) return;
    await addItem(inputText.trim());
    setInputText('');
  };

  const handleCapturePress = (item: BrainDumpItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.text,
          options: ['Cancel', 'Move to Today', 'Save for later', 'Delete'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleMoveToToday(item);
          } else if (buttonIndex === 2) {
            await handleMoveToLater(item);
          } else if (buttonIndex === 3) {
            await deleteItem(item.id);
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
            text: 'Move to Today',
            onPress: () => handleMoveToToday(item),
          },
          {
            text: 'Save for later',
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
    await addFromBrainDump(item.text, 'today');
    await deleteItem(item.id);
  };

  const handleMoveToLater = async (item: BrainDumpItem) => {
    await addFromBrainDump(item.text, 'later');
    await deleteItem(item.id);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Warm, inviting header */}
        <View style={styles.headerSection}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            What's on your mind?
          </Text>
        </View>

        {/* Multi-line input area */}
        <View style={styles.inputSection}>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSubtle,
              },
            ]}
            placeholder="Type anything..."
            placeholderTextColor={theme.colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleAddCapture}
            onBlur={() => {
              if (inputText.trim()) {
                handleAddCapture();
              }
            }}
            returnKeyType="done"
            multiline
            blurOnSubmit
            textAlignVertical="top"
          />
        </View>

        {/* Recent captures list */}
        {recentItems.length > 0 && (
          <View style={styles.capturesSection}>
            {recentItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.captureItem,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => handleCapturePress(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.captureText, { color: theme.colors.textSecondary }]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))}
            {items.length > 3 && (
              <Text style={[styles.moreHint, { color: theme.colors.textTertiary }]}>
                +{items.length - 3} more
              </Text>
            )}
          </View>
        )}

        {/* Spacer to push bottom actions down */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom actions - de-emphasized */}
      <View style={[styles.bottomSection, { borderTopColor: theme.colors.borderSubtle }]}>
        <Text style={[styles.bottomPrompt, { color: theme.colors.textTertiary }]}>
          Ready to do something?
        </Text>
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={onPickItem}
            activeOpacity={0.7}
          >
            <Text style={[styles.bottomButtonText, { color: theme.colors.textSecondary }]}>
              Pick one thing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={onStartRoutine}
            activeOpacity={0.7}
          >
            <Text style={[styles.bottomButtonText, { color: theme.colors.textSecondary }]}>
              Start routine
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  headerSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  inputSection: {
    marginBottom: 24,
  },
  input: {
    fontSize: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 120,
    lineHeight: 26,
  },
  capturesSection: {
    gap: 10,
  },
  captureItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
  },
  captureText: {
    fontSize: 15,
    lineHeight: 21,
  },
  moreHint: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    gap: 12,
  },
  bottomPrompt: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  bottomButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
