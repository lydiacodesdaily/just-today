/**
 * BrainDump.tsx
 * Brain Dump section component - quick capture for unsorted thoughts
 */

import React, { useState } from 'react';
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
} from 'react-native';
import { useTheme } from '../constants/theme';
import { useBrainDump } from '../context/BrainDumpContext';
import { useFocus } from '../context/FocusContext';
import { BrainDumpItem } from '../models/BrainDumpItem';
import { FocusDuration } from '../models/FocusItem';

interface BrainDumpProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function BrainDump({ isExpanded, onToggle }: BrainDumpProps) {
  const theme = useTheme();
  const { items, addItem, keepItem, deleteItem } = useBrainDump();
  const { addToLater } = useFocus();
  const [inputText, setInputText] = useState('');

  const handleAddItem = async () => {
    if (!inputText.trim()) return;

    await addItem(inputText.trim());
    setInputText('');
  };

  const handleItemPress = (item: BrainDumpItem) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.text,
          options: ['Cancel', '🧷 Keep (Move to Later)', 'Delete'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleKeepItem(item);
          } else if (buttonIndex === 2) {
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
            text: '🧷 Keep (Move to Later)',
            onPress: () => handleKeepItem(item),
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

  const handleKeepItem = async (item: BrainDumpItem) => {
    // Move to Later list with default duration
    await addToLater(item.text, '15-30min' as FocusDuration);
    // Remove from brain dump
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
        {/* Section Header */}
        <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              🧠 Brain Dump
            </Text>
            <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
              This is a temporary space.
            </Text>
            <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
              Unsorted thoughts clear automatically.
            </Text>
          </View>
        </TouchableOpacity>

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

        {/* Recent Items List (max 3) */}
        {recentItems.length > 0 && (
          <View style={styles.itemsList}>
            {recentItems.map((item) => (
              <TouchableOpacity
                key={item.id}
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
            ))}
          </View>
        )}

        {items.length > 3 && (
          <Text style={[styles.moreItemsHint, { color: theme.colors.textTertiary }]}>
            +{items.length - 3} more thought{items.length - 3 !== 1 ? 's' : ''}
          </Text>
        )}
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
});
