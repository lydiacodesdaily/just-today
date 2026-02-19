/**
 * BrainDumpBar.tsx
 * Persistent top capture bar for the Today screen.
 * Collapses to a slim tappable row; expands to the full brain dump capture UI.
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
  Animated,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { useBrainDump } from '../context/BrainDumpContext';
import { useFocus } from '../context/FocusContext';
import { BrainDumpItem } from '../models/BrainDumpItem';

interface BrainDumpBarProps {
  /** If true the bar starts expanded (used on empty days) */
  initiallyExpanded?: boolean;
}

export function BrainDumpBar({ initiallyExpanded = false }: BrainDumpBarProps) {
  const theme = useTheme();
  const { items, addItem, keepItem, deleteItem } = useBrainDump();
  const { addFromBrainDump } = useFocus();

  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [inputText, setInputText] = useState('');
  const [pendingText, setPendingText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingTextRef = useRef<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput | null>(null);

  // Keep ref in sync with state
  pendingTextRef.current = pendingText;

  // Sync initial expansion if prop changes (e.g. first item added then removed)
  useEffect(() => {
    if (initiallyExpanded) setIsExpanded(true);
  }, [initiallyExpanded]);

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

  const confirmDestination = useCallback(
    async (destination: 'braindump' | 'today' | 'later') => {
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
    },
    [addItem, addFromBrainDump]
  );

  const handleAddItem = () => {
    if (!inputText.trim()) return;
    if (pendingTextRef.current) confirmDestination('braindump');

    const text = inputText.trim();
    setPendingText(text);
    pendingTextRef.current = text;
    setInputText('');

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(
      () => confirmDestination('braindump'),
      2500
    );
  };

  const handleExpandAndFocus = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleItemPress = (item: BrainDumpItem) => {
    const moveToToday = async () => {
      await addFromBrainDump(item.text, 'today');
      deleteItem(item.id);
    };
    const moveToLater = async () => {
      await addFromBrainDump(item.text, 'later');
      keepItem(item.id);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.text,
          options: ['Cancel', '↗️ Today', '🧷 Later', 'Delete'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) moveToToday();
          else if (buttonIndex === 2) moveToLater();
          else if (buttonIndex === 3) deleteItem(item.id);
        }
      );
    } else {
      Alert.alert(item.text, undefined, [
        { text: 'Cancel', style: 'cancel' },
        { text: '↗️ Today', onPress: moveToToday },
        { text: '🧷 Later', onPress: moveToLater },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteItem(item.id),
        },
      ]);
    }
  };

  const recentItems = items.slice(-3).reverse();

  // ── Collapsed state ───────────────────────────────────────────────────────
  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={[
          styles.collapsedBar,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={handleExpandAndFocus}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.collapsedPlaceholder,
            { color: theme.colors.textTertiary },
          ]}
        >
          Capture a thought...
        </Text>
        <Text
          style={[styles.collapsedIcon, { color: theme.colors.textTertiary }]}
        >
          ✎
        </Text>
      </TouchableOpacity>
    );
  }

  // ── Expanded state ────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View
        style={[
          styles.expandedContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {/* Header row with label + collapse button */}
        <View style={styles.expandedHeader}>
          <Text
            style={[
              styles.expandedLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Brain Dump
          </Text>
          <TouchableOpacity
            onPress={() => setIsExpanded(false)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Text
              style={[
                styles.collapseButton,
                { color: theme.colors.textTertiary },
              ]}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              borderColor: pendingText
                ? theme.colors.textTertiary
                : theme.colors.border,
              opacity: pendingText ? 0.5 : 1,
            },
          ]}
          placeholder="Dump anything on your mind..."
          placeholderTextColor={theme.colors.textTertiary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleAddItem}
          returnKeyType="done"
          blurOnSubmit
          editable={!pendingText}
        />

        {/* Destination picker after submitting */}
        {pendingText && (
          <View
            style={[
              styles.destinationRow,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.destinationLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Where should this go?
            </Text>
            <View style={styles.destinationPills}>
              <TouchableOpacity
                style={[
                  styles.pill,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => confirmDestination('braindump')}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, { color: theme.colors.surface }]}>
                  Brain Dump
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pill,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => confirmDestination('today')}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, { color: theme.colors.text }]}>
                  Today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pill,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => confirmDestination('later')}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, { color: theme.colors.text }]}>
                  Later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Toast feedback */}
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

        {/* Recent brain dump items (max 3) */}
        {recentItems.length > 0 && (
          <View style={styles.recentItems}>
            {recentItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.recentItem,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.borderSubtle,
                  },
                ]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.recentItemText,
                    { color: theme.colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {item.text}
                </Text>
                <Text
                  style={[
                    styles.recentItemHint,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  tap to move
                </Text>
              </TouchableOpacity>
            ))}
            {items.length > 3 && (
              <Text
                style={[
                  styles.moreHint,
                  { color: theme.colors.textTertiary },
                ]}
              >
                +{items.length - 3} more thought
                {items.length - 3 !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Collapsed
  collapsedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  collapsedPlaceholder: {
    fontSize: 15,
    flex: 1,
  },
  collapsedIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  // Expanded
  expandedContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandedLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  collapseButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
  },
  // Destination
  destinationRow: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  destinationLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  destinationPills: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Toast
  toast: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Recent items
  recentItems: {
    gap: 6,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  recentItemText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  recentItemHint: {
    fontSize: 11,
  },
  moreHint: {
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 2,
  },
});
