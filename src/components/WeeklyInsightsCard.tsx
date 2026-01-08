/**
 * WeeklyInsightsCard.tsx
 * Display weekly patterns and insights
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../constants/theme';
import { WeeklyInsight } from '../utils/reflectionInsights';

interface WeeklyInsightsCardProps {
  insights: WeeklyInsight[];
}

export function WeeklyInsightsCard({ insights }: WeeklyInsightsCardProps) {
  const theme = useTheme();

  if (insights.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          This Week's Patterns
        </Text>
        <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
          Keep going for a few more days and we'll start noticing patterns in what works for you.
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
          No pressure — insights will appear when you're ready.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
        This Week's Patterns
      </Text>

      {insights.map((insight, index) => (
        <View
          key={`${insight.type}-${index}`}
          style={[
            styles.insightCard,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>{insight.icon}</Text>
            <Text style={[styles.insightTitle, { color: theme.colors.text }]}>
              {insight.title}
            </Text>
          </View>
          <Text style={[styles.insightMessage, { color: theme.colors.text }]}>
            {insight.message}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    lineHeight: 20,
  },
  insightCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  insightMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
});
