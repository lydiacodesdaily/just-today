/**
 * CaptureScreen.tsx
 * Capture Mode - calm, low-pressure thought offloading screen
 * Shown when user has no committed items for today
 */

import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { useBrainDump } from '../context/BrainDumpContext';
import { useFocus } from '../context/FocusContext';
import { usePace } from '../context/PaceContext';
import { BrainDumpItem } from '../models/BrainDumpItem';
import { PacePromptBanner } from './PacePromptBanner';

interface CaptureScreenProps {
  onPickItem: () => void;
  onStartRoutine: () => void;
  onViewToday: () => void;
}

export function CaptureScreen({ onPickItem, onStartRoutine, onViewToday }: CaptureScreenProps) {
  const theme = useTheme();
  const { items, addItem, deleteItem } = useBrainDump();
  const { addFromBrainDump } = useFocus();
  const { hasSelectedForToday } = usePace();
  const [inputText, setInputText] = useState('');
  const [showPostCaptureToast, setShowPostCaptureToast] = useState(false);
  const [justCapturedId, setJustCapturedId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const highlightOpacity = useRef(new Animated.Value(0)).current;

  // Display only the last 3 items (most recent first)
  const recentItems = items.slice(-3).reverse();

  // Toast animation handler
  useEffect(() => {
    if (showPostCaptureToast) {
      // Fade in
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowPostCaptureToast(false);
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showPostCaptureToast, toastOpacity]);

  // Highlight animation handler
  useEffect(() => {
    if (justCapturedId) {
      // Pulse highlight
      Animated.sequence([
        Animated.timing(highlightOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(highlightOpacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setJustCapturedId(null);
      });
    }
  }, [justCapturedId, highlightOpacity]);

  const handleAddCapture = async () => {
    if (!inputText.trim()) return;
    const newItem = await addItem(inputText.trim());
    setInputText('');

    // Trigger post-capture feedback
    setShowPostCaptureToast(true);
    setJustCapturedId(newItem.id);

    // Auto-scroll to show recent captures
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 300, animated: true });
    }, 100);
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

  // Dynamic bottom prompt based on capture count
  const getBottomPrompt = () => {
    if (items.length === 0) {
      return "Ready to do something?";
    } else if (items.length <= 2) {
      return `Nice! Got ${items.length} ${items.length === 1 ? 'idea' : 'ideas'} saved. Pick one to start?`;
    } else {
      return `You have ${items.length} ideas. Let's pick one to work on!`;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Post-capture confirmation toast */}
      {showPostCaptureToast && (
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
          <View style={styles.toastContent}>
            <Text style={[styles.toastText, { color: theme.colors.text }]}>
              Captured! You have {items.length} {items.length === 1 ? 'idea' : 'ideas'} saved
            </Text>
            <TouchableOpacity
              style={styles.toastAction}
              onPress={() => {
                setShowPostCaptureToast(false);
                onPickItem();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.toastActionText, { color: theme.colors.success }]}>
                Pick one now →
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <ScrollView
        ref={scrollViewRef}
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
          <TouchableOpacity
            style={styles.viewTodayLink}
            onPress={onViewToday}
            activeOpacity={0.6}
          >
            <Text style={[styles.viewTodayText, { color: theme.colors.textSecondary }]}>
              View Today →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pace prompt banner - shows when user hasn't selected pace for today */}
        {!hasSelectedForToday && <PacePromptBanner />}

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
            returnKeyType="default"
            multiline
            textAlignVertical="top"
          />

          {/* Helper text and button */}
          <View style={styles.inputFooter}>
            <Text style={[styles.helperText, { color: theme.colors.textTertiary }]}>
              You don't have to decide what to do with this yet.
            </Text>
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.colors.primary },
                !inputText.trim() && styles.saveButtonDisabled,
              ]}
              onPress={handleAddCapture}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Save for now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent captures list */}
        {recentItems.length > 0 && (
          <View style={styles.capturesSection}>
            <Text style={[styles.capturesHint, { color: theme.colors.textTertiary }]}>
              Items here disappear in 24 hours unless you move them.
            </Text>
            {recentItems.map((item) => {
              const isJustCaptured = item.id === justCapturedId;
              return (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.captureItemWrapper,
                    isJustCaptured && {
                      opacity: highlightOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1],
                      }),
                      backgroundColor: highlightOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['transparent', theme.colors.successSubtle],
                      } as any),
                      borderRadius: 10,
                    },
                  ]}
                >
                  <TouchableOpacity
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
                </Animated.View>
              );
            })}
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

      {/* Bottom actions - becomes more prominent after captures */}
      <View style={[styles.bottomSection, { borderTopColor: theme.colors.borderSubtle }]}>
        <Text style={[styles.bottomPrompt, { color: items.length > 0 ? theme.colors.text : theme.colors.textTertiary }]}>
          {getBottomPrompt()}
        </Text>
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[
              styles.bottomButton,
              items.length > 0 && [
                styles.bottomButtonElevated,
                {
                  backgroundColor: theme.colors.primarySubtle,
                  borderColor: theme.colors.primary,
                },
              ],
            ]}
            onPress={onPickItem}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.bottomButtonText,
              { color: items.length > 0 ? theme.colors.primary : theme.colors.textSecondary },
            ]}>
              Pick one thing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.bottomButton,
              items.length > 0 && [
                styles.bottomButtonElevated,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSubtle,
                },
              ],
            ]}
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
  toast: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    zIndex: 1000,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toastContent: {
    gap: 8,
  },
  toastText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  toastAction: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  toastActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: -0.3,
    lineHeight: 36,
    marginBottom: 8,
  },
  viewTodayLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  viewTodayText: {
    fontSize: 14,
    fontWeight: '500',
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
  inputFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  capturesSection: {
    gap: 10,
  },
  capturesHint: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  captureItemWrapper: {
    marginBottom: 0,
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
  bottomButtonElevated: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
