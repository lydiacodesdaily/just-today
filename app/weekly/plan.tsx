/**
 * plan.tsx
 * Weekly planning screen - select items for the week, star priorities, finalize.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../src/constants/theme';
import { useWeeklyIntent } from '../../src/context/WeeklyIntentContext';
import { useFocus } from '../../src/context/FocusContext';
import { generatePlanSummary, isWeekOver } from '../../src/models/WeeklyIntent';
import { FocusItem } from '../../src/models/FocusItem';

const MAX_PRIORITIES = 3;

export default function WeeklyPlanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    currentIntent,
    startPlanning,
    addItem,
    removeItem,
    togglePriority,
    finalizePlan,
    shouldShowReviewNudge,
    refreshIntents,
  } = useWeeklyIntent();
  const { laterItems } = useFocus();

  const [newItemTitle, setNewItemTitle] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  // Ensure we have an intent for this week
  useEffect(() => {
    const init = async () => {
      if (!currentIntent || currentIntent.status === 'reviewed') {
        await startPlanning();
      }
      setIsInitializing(false);
    };
    init();
  }, []);

  const handleAddNewItem = useCallback(async () => {
    const title = newItemTitle.trim();
    if (!title || !currentIntent) return;
    await addItem(`new-${Date.now()}`, title);
    setNewItemTitle('');
  }, [newItemTitle, currentIntent, addItem]);

  const handleAddFromLater = useCallback(async (item: FocusItem) => {
    if (!currentIntent) return;
    // Check if already added
    const alreadyAdded = currentIntent.items.some((wi) => wi.focusItemId === item.id);
    if (alreadyAdded) return;
    await addItem(item.id, item.title);
  }, [currentIntent, addItem]);

  const handleTogglePriority = useCallback(async (itemId: string) => {
    if (!currentIntent) return;
    const item = currentIntent.items.find((i) => i.id === itemId);
    if (!item) return;

    // Enforce max 3 priorities
    if (!item.isPriority) {
      const currentPriorities = currentIntent.items.filter((i) => i.isPriority).length;
      if (currentPriorities >= MAX_PRIORITIES) {
        Alert.alert('Limit reached', `You can star up to ${MAX_PRIORITIES} top priorities.`);
        return;
      }
    }
    await togglePriority(itemId);
  }, [currentIntent, togglePriority]);

  const handleFinalize = useCallback(async () => {
    if (!currentIntent) return;
    await finalizePlan();
    Alert.alert('Plan activated', 'Your weekly intent is set. You got this.');
  }, [currentIntent, finalizePlan]);

  const handleCopyPlan = useCallback(async () => {
    if (!currentIntent) return;
    const summary = generatePlanSummary(currentIntent);
    await Clipboard.setStringAsync(summary);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  }, [currentIntent]);

  if (isInitializing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Setting up your week...
          </Text>
        </View>
      </View>
    );
  }

  const intentItems = currentIntent?.items || [];
  const priorities = intentItems.filter((i) => i.isPriority);
  const nonPriorities = intentItems.filter((i) => !i.isPriority);
  const isPlanning = currentIntent?.status === 'planning';
  const isActive = currentIntent?.status === 'active';

  // Later items not already in weekly intent
  const availableLaterItems = laterItems.filter(
    (li) => !intentItems.some((wi) => wi.focusItemId === li.id)
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={[styles.backText, { color: theme.colors.primary }]}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.header, { color: theme.colors.text }]}>
            This Week
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Pick what matters this week. Nothing here auto-fills Today.
          </Text>
        </View>

        {/* Top Priorities */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
            TOP PRIORITIES
          </Text>
          {priorities.length === 0 ? (
            <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>
              Star up to {MAX_PRIORITIES} items below to mark as priorities
            </Text>
          ) : (
            <View style={styles.itemList}>
              {priorities.map((item) => (
                <View
                  key={item.id}
                  style={[styles.itemRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
                >
                  <TouchableOpacity
                    onPress={() => handleTogglePriority(item.id)}
                    style={styles.starButton}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Remove from priorities"
                  >
                    <Text style={[styles.starActive, { color: theme.colors.primary }]}>★</Text>
                  </TouchableOpacity>
                  <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={2}>
                    {item.titleSnapshot}
                  </Text>
                  {isPlanning && (
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      style={styles.removeButton}
                      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Remove item"
                    >
                      <Text style={[styles.removeText, { color: theme.colors.textSecondary }]}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* This week items */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
            THIS WEEK
          </Text>
          {intentItems.length === 0 ? (
            <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>
              Add items from Later or type a new one below
            </Text>
          ) : (
            <View style={styles.itemList}>
              {nonPriorities.map((item) => (
                <View
                  key={item.id}
                  style={[styles.itemRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle }]}
                >
                  <TouchableOpacity
                    onPress={() => handleTogglePriority(item.id)}
                    style={styles.starButton}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Star as priority"
                  >
                    <Text style={[styles.starInactive, { color: theme.colors.textSecondary }]}>☆</Text>
                  </TouchableOpacity>
                  <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={2}>
                    {item.titleSnapshot}
                  </Text>
                  {item.outcome === 'completed' && (
                    <Text style={[styles.completedBadge, { color: theme.colors.primary }]}>✓</Text>
                  )}
                  {isPlanning && (
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      style={styles.removeButton}
                      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Remove item"
                    >
                      <Text style={[styles.removeText, { color: theme.colors.textSecondary }]}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Add new item inline */}
          {(isPlanning || isActive) && (
            <View style={[styles.addItemRow, { borderColor: theme.colors.borderSubtle }]}>
              <TextInput
                style={[styles.addItemInput, { color: theme.colors.text }]}
                placeholder="Add something for this week..."
                placeholderTextColor={theme.colors.textSecondary}
                value={newItemTitle}
                onChangeText={setNewItemTitle}
                onSubmitEditing={handleAddNewItem}
                returnKeyType="done"
              />
              {newItemTitle.trim().length > 0 && (
                <TouchableOpacity
                  onPress={handleAddNewItem}
                  style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Add item"
                >
                  <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* From Later */}
        {(isPlanning || isActive) && availableLaterItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              FROM LATER
            </Text>
            <View style={styles.itemList}>
              {availableLaterItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.laterItemRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle }]}
                  onPress={() => handleAddFromLater(item)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Add "${item.title}" to this week`}
                >
                  <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.addLabel, { color: theme.colors.primary }]}>+ Add</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          {isPlanning && intentItems.length > 0 && (
            <TouchableOpacity
              style={[styles.primaryAction, { backgroundColor: theme.colors.primary }]}
              onPress={handleFinalize}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Finalize plan"
            >
              <Text style={[styles.primaryActionText, { color: theme.colors.surface }]}>
                Finalize plan
              </Text>
            </TouchableOpacity>
          )}

          {intentItems.length > 0 && (
            <TouchableOpacity
              style={[styles.secondaryAction, { borderColor: theme.colors.primary }]}
              onPress={handleCopyPlan}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Copy plan to clipboard"
            >
              <Text style={[styles.secondaryActionText, { color: theme.colors.primary }]}>
                {copiedFeedback ? 'Copied!' : 'Copy plan'}
              </Text>
            </TouchableOpacity>
          )}

          {shouldShowReviewNudge && (
            <TouchableOpacity
              style={[styles.tertiaryAction]}
              onPress={() => router.push('/weekly/review' as any)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Review last week"
            >
              <Text style={[styles.tertiaryActionText, { color: theme.colors.primary }]}>
                Review last week →
              </Text>
            </TouchableOpacity>
          )}

          {isActive && currentIntent && isWeekOver(currentIntent) && (
            <TouchableOpacity
              style={[styles.tertiaryAction]}
              onPress={() => router.push('/weekly/review' as any)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Go to review"
            >
              <Text style={[styles.tertiaryActionText, { color: theme.colors.primary }]}>
                Go to review →
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
  },
  headerSection: {
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  emptyHint: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  itemList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  laterItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  starButton: {
    padding: 4,
  },
  starActive: {
    fontSize: 20,
  },
  starInactive: {
    fontSize: 20,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },
  completedBadge: {
    fontSize: 16,
    fontWeight: '700',
  },
  removeButton: {
    padding: 4,
  },
  removeText: {
    fontSize: 16,
  },
  addLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  addItemInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    paddingVertical: 4,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  actionsSection: {
    gap: 12,
    marginTop: 8,
  },
  primaryAction: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryAction: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tertiaryAction: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tertiaryActionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 20,
  },
});
