/**
 * reflections.tsx
 * Gentle, affirming daily and weekly reflections
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../src/constants/theme';
import { CheckInSection } from '../../src/components/CheckInSection';
import { DailySnapshot, formatFocusTime } from '../../src/models/DailySnapshot';
import {
  loadTodaySnapshot,
  getWeekSnapshots,
} from '../../src/persistence/snapshotStore';
import {
  getTodayReflectionMessage,
  getPaceMessage,
  getLaterItemsMessage,
  getClosingMessage,
  getWeeklyReflectionMessage,
  getPaceEmoji,
} from '../../src/utils/reflectionMessages';

// Map internal storage keys to user-facing pace labels
const getPaceLabel = (mode: string): string => {
  switch (mode) {
    case 'low':
      return 'Gentle';
    case 'steady':
      return 'Steady';
    case 'flow':
      return 'Deep';
    default:
      return mode.charAt(0).toUpperCase() + mode.slice(1);
  }
};

export default function ReflectionsScreen() {
  const theme = useTheme();
  const [todaySnapshot, setTodaySnapshot] = useState<DailySnapshot | null>(null);
  const [weekSnapshots, setWeekSnapshots] = useState<DailySnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReflections();
  }, []);

  const loadReflections = async () => {
    setIsLoading(true);
    try {
      const [today, week] = await Promise.all([
        loadTodaySnapshot(),
        getWeekSnapshots(new Date()),
      ]);
      setTodaySnapshot(today);
      setWeekSnapshots(week);
    } catch (error) {
      console.error('Failed to load reflections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !todaySnapshot) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  const hasActivity =
    todaySnapshot.focusItemsCompleted > 0 ||
    todaySnapshot.routineRunsCompleted > 0 ||
    todaySnapshot.totalFocusTimeMs > 0;

  const paceMessage = getPaceMessage(todaySnapshot.pacesSelected);
  const laterMessage = getLaterItemsMessage(todaySnapshot.itemsMovedToLater);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Check-ins */}
      <CheckInSection />

      {/* Today's Story Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface, marginTop: theme.spacing.lg }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Today's Story
        </Text>
        <Text
          style={[
            styles.date,
            { color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
          ]}
        >
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {hasActivity ? (
          <View style={styles.activityList}>
            {/* Focus items completed */}
            {todaySnapshot.focusItemsCompleted > 0 && (
              <View style={styles.activityItem}>
                <Text style={[styles.activityIcon]}>🎯</Text>
                <Text style={[styles.activityText, { color: theme.colors.text }]}>
                  You focused on {todaySnapshot.focusItemsCompleted} thing
                  {todaySnapshot.focusItemsCompleted === 1 ? '' : 's'}
                </Text>
              </View>
            )}

            {/* Focus time */}
            {todaySnapshot.totalFocusTimeMs > 0 && (
              <View style={styles.activityItem}>
                <Text style={[styles.activityIcon]}>⏱️</Text>
                <Text style={[styles.activityText, { color: theme.colors.text }]}>
                  {formatFocusTime(todaySnapshot.totalFocusTimeMs)} of focus time
                </Text>
              </View>
            )}

            {/* Routines completed */}
            {todaySnapshot.routineRunsCompleted > 0 && (
              <View style={styles.activityItem}>
                <Text style={[styles.activityIcon]}>✓</Text>
                <Text style={[styles.activityText, { color: theme.colors.text }]}>
                  Completed {todaySnapshot.routineRunsCompleted} routine
                  {todaySnapshot.routineRunsCompleted === 1 ? '' : 's'}
                </Text>
              </View>
            )}

            {/* Pace */}
            {todaySnapshot.pacesSelected.length > 0 && (
              <View style={styles.activityItem}>
                <Text style={[styles.activityIcon]}>
                  {getPaceEmoji(todaySnapshot.pacesSelected[0])}
                </Text>
                <Text style={[styles.activityText, { color: theme.colors.text }]}>
                  {todaySnapshot.pacesSelected.length === 1
                    ? `${getPaceLabel(todaySnapshot.pacesSelected[0])} pace`
                    : `${todaySnapshot.pacesSelected.length} pace changes`}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.restMessage}>
            <Text style={[styles.restIcon]}>🌙</Text>
            <Text style={[styles.restText, { color: theme.colors.textSecondary }]}>
              Some days are for rest
            </Text>
          </View>
        )}

        {/* Items moved to Later */}
        {laterMessage && (
          <Text
            style={[
              styles.laterText,
              { color: theme.colors.textTertiary, marginTop: theme.spacing.md },
            ]}
          >
            [{laterMessage}]
          </Text>
        )}

        {/* Pace message */}
        {paceMessage && (
          <Text
            style={[
              styles.paceMessage,
              {
                color: theme.colors.textSecondary,
                marginTop: theme.spacing.lg,
              },
            ]}
          >
            {paceMessage}
          </Text>
        )}

        {/* Main reflection message */}
        <Text
          style={[
            styles.reflectionMessage,
            {
              color: theme.colors.text,
              marginTop: theme.spacing.lg,
            },
          ]}
        >
          {getTodayReflectionMessage(todaySnapshot)}
        </Text>

        {/* Closing message */}
        <Text
          style={[
            styles.closingMessage,
            {
              color: theme.colors.textSecondary,
              marginTop: theme.spacing.md,
            },
          ]}
        >
          {getClosingMessage()}
        </Text>
      </View>

      {/* Weekly View */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, marginTop: theme.spacing.lg },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>This Week</Text>

        {/* Week dots visualization */}
        <View style={styles.weekContainer}>
          <View style={styles.weekDays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
              const snapshot = weekSnapshots[index];
              const hasActivity =
                snapshot &&
                (snapshot.focusItemsCompleted > 0 ||
                  snapshot.routineRunsCompleted > 0 ||
                  snapshot.totalFocusTimeMs > 0);

              return (
                <View key={day} style={styles.weekDay}>
                  <Text
                    style={[
                      styles.dayLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {day}
                  </Text>
                  <View
                    style={[
                      styles.dayDot,
                      {
                        backgroundColor: hasActivity
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Weekly message */}
        <Text
          style={[
            styles.weeklyMessage,
            {
              color: theme.colors.text,
              marginTop: theme.spacing.lg,
            },
          ]}
        >
          {getWeeklyReflectionMessage(weekSnapshots)}
        </Text>

        <Text
          style={[
            styles.weeklyClosing,
            {
              color: theme.colors.textSecondary,
              marginTop: theme.spacing.md,
            },
          ]}
        >
          That matters.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  card: {
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    fontSize: 24,
    width: 32,
  },
  activityText: {
    fontSize: 18,
    lineHeight: 27,
    letterSpacing: 0.3,
    flex: 1,
  },
  restMessage: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  restIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  restText: {
    fontSize: 18,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  laterText: {
    fontSize: 14,
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
  paceMessage: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  reflectionMessage: {
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0.3,
    fontWeight: '500',
  },
  closingMessage: {
    fontSize: 16,
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
  weekContainer: {
    marginTop: 24,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    alignItems: 'center',
    gap: 12,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  dayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  weeklyMessage: {
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0.3,
    fontWeight: '500',
    textAlign: 'center',
  },
  weeklyClosing: {
    fontSize: 16,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
