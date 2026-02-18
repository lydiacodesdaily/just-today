/**
 * WeeklyIntentBanner.tsx
 * A calm banner on the Today screen for weekly intent status.
 * Shows planning nudge, active summary, or review prompt.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../constants/theme';
import { useWeeklyIntent } from '../context/WeeklyIntentContext';
import { isWeekOver } from '../models/WeeklyIntent';

export function WeeklyIntentBanner() {
  const theme = useTheme();
  const router = useRouter();
  const {
    currentIntent,
    shouldShowPlanningNudge,
    shouldShowReviewNudge,
    dismissPlanningNudge,
  } = useWeeklyIntent();

  // State 3: Week is over and intent not reviewed
  if (shouldShowReviewNudge && currentIntent) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.primarySubtle,
            borderColor: theme.colors.primary,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.textContent}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Ready to review last week
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              See what you accomplished
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/weekly/review' as any)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Review last week"
          >
            <Text style={[styles.ctaText, { color: theme.colors.surface }]}>
              Review
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // State 2: Active intent exists this week
  if (currentIntent && currentIntent.status === 'active' && !isWeekOver(currentIntent)) {
    const total = currentIntent.items.length;
    const done = currentIntent.items.filter((i) => i.outcome === 'completed').length;

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.textContent}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              This week: {total} item{total !== 1 ? 's' : ''}, {done} done
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.ctaButtonOutline, { borderColor: theme.colors.primary }]}
            onPress={() => router.push('/weekly/plan' as any)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View weekly plan"
          >
            <Text style={[styles.ctaTextOutline, { color: theme.colors.primary }]}>
              View
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // State 1: Planning day and no active intent
  if (shouldShowPlanningNudge) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.primarySubtle,
            borderColor: theme.colors.primary,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={dismissPlanningNudge}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Dismiss planning prompt"
        >
          <Text style={[styles.closeIcon, { color: theme.colors.textSecondary }]}>
            ✕
          </Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <View style={styles.textContent}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Weekly planning day
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Pick what matters this week
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/weekly/plan' as any)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Set weekly intent"
          >
            <Text style={[styles.ctaText, { color: theme.colors.surface }]}>
              Plan
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Nothing to show
  return null;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 4,
  },
  closeIcon: {
    fontSize: 18,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textContent: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  ctaButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ctaButtonOutline: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  ctaTextOutline: {
    fontSize: 14,
    fontWeight: '600',
  },
});
