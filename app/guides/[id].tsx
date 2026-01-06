/**
 * guides/[id].tsx
 * Individual guide view with checklist
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useGuides } from '../../src/context/GuidesContext';
import { useTheme } from '../../src/constants/theme';
import { GuideItemCheckbox } from '../../src/components/GuideItemCheckbox';
import { Guide, GuideItem } from '../../src/models/Guide';

export default function GuideDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allGuides, activeSession, startSession, toggleItem, endSession, deleteGuide } = useGuides();

  const [guide, setGuide] = useState<Guide | null>(null);

  // Load guide when component mounts
  useEffect(() => {
    const foundGuide = allGuides.find((g) => g.id === id);
    if (foundGuide) {
      setGuide(foundGuide);
      // Start session if not already active for this guide
      if (!activeSession || activeSession.guideId !== id) {
        startSession(id);
      }
    }
  }, [id, allGuides]);

  // Auto-save and cleanup on unmount
  useEffect(() => {
    return () => {
      // End session when leaving the screen
      endSession();
    };
  }, []);

  if (!guide) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>Guide not found</Text>
        </View>
      </View>
    );
  }

  // Build items with checked state from active session
  const itemsWithState: GuideItem[] = guide.items.map((item) => ({
    ...item,
    checked: activeSession?.guideId === id ? activeSession.checkedItems.includes(item.id) : false,
  }));

  const checkedCount = itemsWithState.filter((item) => item.checked).length;
  const totalCount = itemsWithState.length;

  const handleDeleteGuide = () => {
    Alert.alert('Delete Guide', 'Are you sure you want to delete this custom guide?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteGuide(id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
              <Feather name="chevron-left" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{guide.title}</Text>
              {!guide.isDefault && (
                <View style={[styles.badge, { backgroundColor: theme.colors.surfaceSecondary }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>Custom</Text>
                </View>
              )}
            </View>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surface }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.colors.success,
                    width: totalCount > 0 ? `${(checkedCount / totalCount) * 100}%` : '0%',
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {checkedCount} of {totalCount}
            </Text>
          </View>
        </View>

        {/* Checklist Items */}
        <View style={[styles.itemsContainer, { backgroundColor: theme.colors.surface }]}>
          {itemsWithState.map((item) => (
            <GuideItemCheckbox key={item.id} item={item} onToggle={() => toggleItem(item.id)} />
          ))}
        </View>

        {/* Actions (for custom guides) */}
        {!guide.isDefault && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: theme.colors.border }]}
              onPress={handleDeleteGuide}
              activeOpacity={0.7}
            >
              <Feather name="trash-2" size={18} color={theme.colors.danger} />
              <Text style={[styles.actionButtonText, { color: theme.colors.danger }]}>Delete Guide</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Helper text */}
        <Text style={[styles.helperText, { color: theme.colors.textTertiary }]}>
          Checkmarks will reset when you close this guide or after 10 minutes of inactivity.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
    marginLeft: -8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
