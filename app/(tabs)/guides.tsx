/**
 * (tabs)/guides.tsx
 * Guides tab - main guides list screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useGuides } from '../../src/context/GuidesContext';
import { useTheme } from '../../src/constants/theme';
import { GuideCard } from '../../src/components/GuideCard';
import { CreateGuideModal } from '../../src/components/CreateGuideModal';

export default function GuidesTab() {
  const theme = useTheme();
  const router = useRouter();
  const { defaultGuides, customGuides, getCustomGuideCount, canCreateCustomGuide, createGuide } = useGuides();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleGuidePress = (guideId: string) => {
    router.push(`/guides/${guideId}` as any);
  };

  const handleCreateGuide = async () => {
    const canCreate = await canCreateCustomGuide();
    if (!canCreate) {
      Alert.alert(
        'Free Tier Limit',
        "You've created 3 custom guides (free plan limit). Upgrade to create unlimited guides, or edit your existing ones.",
        [{ text: 'OK' }]
      );
      return;
    }

    setShowCreateModal(true);
  };

  const handleCreate = async (title: string, items: string[]) => {
    try {
      await createGuide(title, items);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create guide');
    }
  };

  const customGuideCount = getCustomGuideCount();
  const guideLimit = 3;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Guides</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Support for context transitions
          </Text>
        </View>

        {/* Default Guides Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Default Guides
          </Text>
          <View style={styles.guideList}>
            {defaultGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} onPress={() => handleGuidePress(guide.id)} />
            ))}
          </View>
        </View>

        {/* Custom Guides Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              Custom Guides
            </Text>
            <Text style={[styles.guideCount, { color: theme.colors.textTertiary }]}>
              {customGuideCount} / {guideLimit}
            </Text>
          </View>

          {customGuides.length > 0 ? (
            <View style={styles.guideList}>
              {customGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} onPress={() => handleGuidePress(guide.id)} />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <Feather name="compass" size={32} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No custom guides yet
              </Text>
              <Text style={[styles.emptyHint, { color: theme.colors.textTertiary }]}>
                Create guides for your own context transitions
              </Text>
            </View>
          )}

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={handleCreateGuide}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={20} color={theme.colors.text} />
            <Text style={[styles.createButtonText, { color: theme.colors.text }]}>Create Custom Guide</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Create Guide Modal */}
      <CreateGuideModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />
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
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  guideCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  guideList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
