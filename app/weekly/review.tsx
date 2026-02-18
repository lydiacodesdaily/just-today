/**
 * review.tsx
 * Weekly review screen - see completed vs pending, choose outcomes, write reflection.
 */

import React, { useState, useCallback } from 'react';
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
import { generateReviewSummary } from '../../src/models/WeeklyIntent';
import { WeeklyIntentItem } from '../../src/models/WeeklyIntent';

export default function WeeklyReviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    currentIntent,
    setItemOutcome,
    rollItemToNextWeek,
    finalizeReview,
  } = useWeeklyIntent();

  const [reviewNote, setReviewNote] = useState('');
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const completedItems = currentIntent?.items.filter((i) => i.outcome === 'completed') || [];
  const pendingItems = currentIntent?.items.filter((i) => i.outcome === 'pending') || [];
  const rolledItems = currentIntent?.items.filter((i) => i.outcome === 'rolled-over') || [];
  const returnedItems = currentIntent?.items.filter((i) => i.outcome === 'returned-to-later') || [];

  const handleReturnToLater = useCallback(async (itemId: string) => {
    await setItemOutcome(itemId, 'returned-to-later');
  }, [setItemOutcome]);

  const handleRollForward = useCallback(async (itemId: string) => {
    await rollItemToNextWeek(itemId);
  }, [rollItemToNextWeek]);

  const handleCopyReview = useCallback(async () => {
    if (!currentIntent) return;
    // Temporarily set note for summary generation
    const intentWithNote = { ...currentIntent, reviewNote: reviewNote || undefined };
    const summary = generateReviewSummary(intentWithNote);
    await Clipboard.setStringAsync(summary);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  }, [currentIntent, reviewNote]);

  const handleFinishReview = useCallback(async () => {
    await finalizeReview(reviewNote || undefined);
    Alert.alert('Review complete', 'Nice work this week.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [finalizeReview, reviewNote, router]);

  if (!currentIntent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
            Week in Review
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            No weekly intent to review right now.
          </Text>
        </View>
      </View>
    );
  }

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
            Week in Review
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            See what you accomplished and decide what comes next.
          </Text>
        </View>

        {/* Completed section */}
        {completedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.primary }]}>
              COMPLETED
            </Text>
            <View style={styles.itemList}>
              {completedItems.map((item) => (
                <View
                  key={item.id}
                  style={[styles.completedRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
                >
                  <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
                  <Text style={[styles.itemTitle, styles.completedTitle, { color: theme.colors.text }]} numberOfLines={2}>
                    {item.titleSnapshot}
                  </Text>
                  {item.isPriority && (
                    <Text style={[styles.priorityStar, { color: theme.colors.primary }]}>★</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pending section */}
        {pendingItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              STILL PENDING
            </Text>
            <View style={styles.itemList}>
              {pendingItems.map((item) => (
                <View
                  key={item.id}
                  style={[styles.pendingRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle }]}
                >
                  <View style={styles.pendingItemContent}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={2}>
                      {item.titleSnapshot}
                    </Text>
                    {item.isPriority && (
                      <Text style={[styles.priorityStar, { color: theme.colors.primary }]}>★</Text>
                    )}
                  </View>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity
                      style={[styles.outcomeButton, { backgroundColor: theme.colors.primarySubtle, borderColor: theme.colors.primary }]}
                      onPress={() => handleRollForward(item.id)}
                      activeOpacity={0.7}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Roll to next week"
                    >
                      <Text style={[styles.outcomeButtonText, { color: theme.colors.primary }]}>
                        Next week →
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.outcomeButton, { borderColor: theme.colors.borderSubtle }]}
                      onPress={() => handleReturnToLater(item.id)}
                      activeOpacity={0.7}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Return to Later"
                    >
                      <Text style={[styles.outcomeButtonText, { color: theme.colors.textSecondary }]}>
                        Back to Later
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Rolled over section */}
        {rolledItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              CARRYING FORWARD
            </Text>
            <View style={styles.itemList}>
              {rolledItems.map((item) => (
                <View
                  key={item.id}
                  style={[styles.decidedRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle }]}
                >
                  <Text style={[styles.outcomeIcon, { color: theme.colors.textSecondary }]}>→</Text>
                  <Text style={[styles.itemTitle, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {item.titleSnapshot}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Returned to later section */}
        {returnedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              BACK TO LATER
            </Text>
            <View style={styles.itemList}>
              {returnedItems.map((item) => (
                <View
                  key={item.id}
                  style={[styles.decidedRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderSubtle }]}
                >
                  <Text style={[styles.outcomeIcon, { color: theme.colors.textSecondary }]}>~</Text>
                  <Text style={[styles.itemTitle, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {item.titleSnapshot}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reflection note */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
            REFLECTION (OPTIONAL)
          </Text>
          <TextInput
            style={[
              styles.reflectionInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSubtle,
              },
            ]}
            placeholder="How did this week feel?"
            placeholderTextColor={theme.colors.textSecondary}
            value={reviewNote}
            onChangeText={setReviewNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: theme.colors.primary }]}
            onPress={handleFinishReview}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Finish review"
          >
            <Text style={[styles.primaryActionText, { color: theme.colors.surface }]}>
              Finish review
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryAction, { borderColor: theme.colors.primary }]}
            onPress={handleCopyReview}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Copy review to clipboard"
          >
            <Text style={[styles.secondaryActionText, { color: theme.colors.primary }]}>
              {copiedFeedback ? 'Copied!' : 'Copy review'}
            </Text>
          </TouchableOpacity>
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
  itemList: {
    gap: 8,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
  },
  completedTitle: {
    opacity: 0.8,
  },
  pendingRow: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  pendingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  outcomeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  outcomeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  decidedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  outcomeIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },
  priorityStar: {
    fontSize: 16,
  },
  reflectionInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    minHeight: 80,
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
  bottomSpacer: {
    height: 20,
  },
});
