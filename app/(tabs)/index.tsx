/**
 * index.tsx
 * Home/Today screen - Focus + Later tabs with a persistent Brain Dump capture bar.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { RoutineTemplate } from '../../src/models/RoutineTemplate';
import { loadTemplates } from '../../src/persistence/templateStore';
import {
  createRunFromTemplate,
  createRunFromFocusItem,
  canResumeAbandonedRun,
  resumeAbandonedRun,
} from '../../src/engine/runEngine';
import { useRun } from '../../src/context/RunContext';
import { useFocus } from '../../src/context/FocusContext';
import { usePace } from '../../src/context/PaceContext';
import { useTheme } from '../../src/constants/theme';
import { PaceIndicator } from '../../src/components/PaceIndicator';
import { RoutineCard } from '../../src/components/RoutineCard';
import { PacePicksCollapsible } from '../../src/components/PacePicksCollapsible';
import { TodaysFocus } from '../../src/components/TodaysFocus';
import { LaterList } from '../../src/components/LaterList';
import { BrainDumpBar } from '../../src/components/BrainDumpBar';
import { AddFocusItemModal } from '../../src/components/AddFocusItemModal';
import { SectionLabel } from '../../src/components/SectionLabel';
import { FocusItem } from '../../src/models/FocusItem';
import { moveToToday, triggerCheckOnce } from '../../src/persistence/focusStore';
import { isCheckOnceDue } from '../../src/models/FocusItem';
import { PacePromptBanner } from '../../src/components/PacePromptBanner';
import { WeeklyIntentBanner } from '../../src/components/WeeklyIntentBanner';
import { useSettings } from '../../src/context/SettingsContext';
import { CheckInIndicator } from '../../src/components/CheckInIndicator';
import { FirstEntrySheet } from '../../src/components/FirstEntrySheet';
import { useDailyEntry } from '../../src/context/DailyEntryContext';

type Tab = 'focus' | 'later';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { setCurrentRun, currentRun } = useRun();
  const { todayItems, laterItems, startItemFocus, addToToday, refreshItems } =
    useFocus();
  const { currentPace, hasSelectedForToday } = usePace();
  const { settings } = useSettings();

  const { shouldShow: shouldShowFirstEntry, isLoading: dailyEntryLoading } = useDailyEntry();

  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [hasShownResumePrompt, setHasShownResumePrompt] = useState(false);
  const [showAddFocusModal, setShowAddFocusModal] = useState(false);
  const [isEnergyMenuExpanded, setIsEnergyMenuExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('focus');
  const [showFirstEntry, setShowFirstEntry] = useState(false);

  // Show first-entry flow once per day when context finishes loading
  useEffect(() => {
    if (!dailyEntryLoading && shouldShowFirstEntry()) {
      setShowFirstEntry(true);
    }
  }, [dailyEntryLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prompt user to resume or discard saved run
  useEffect(() => {
    if (
      currentRun &&
      !hasShownResumePrompt &&
      currentRun.status !== 'completed' &&
      currentRun.status !== 'abandoned'
    ) {
      setHasShownResumePrompt(true);
      Alert.alert(
        'Resume Routine?',
        `You have an in-progress routine: "${currentRun.templateName}". Would you like to resume where you left off?`,
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setCurrentRun(null);
              setHasShownResumePrompt(false);
            },
          },
          {
            text: 'Resume',
            onPress: () => router.push('/routine/run'),
          },
        ]
      );
    }
  }, [currentRun, hasShownResumePrompt, router, setCurrentRun]);

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, []);

  // Reload templates and pace picks whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTemplates()
        .then(setTemplates)
        .catch((err) => {
          console.error('Failed to load templates:', err);
          setTemplates([]);
        });

      refreshItems();

    }, [refreshItems, currentPace])
  );

  const handleStartRoutine = (template: RoutineTemplate) => {
    if (
      currentRun &&
      currentRun.status !== 'completed' &&
      currentRun.status !== 'abandoned'
    ) {
      Alert.alert(
        'Routine In Progress',
        `You have "${currentRun.templateName}" in progress. Do you want to discard it and start "${template.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Resume Current',
            onPress: () => router.push('/routine/run'),
          },
          {
            text: 'Start New',
            style: 'destructive',
            onPress: () => {
              const run = createRunFromTemplate(template, currentPace);
              setCurrentRun(run);
              setHasShownResumePrompt(true);
              router.push('/routine/run');
            },
          },
        ]
      );
      return;
    }

    if (canResumeAbandonedRun(currentRun, template.id)) {
      const completedCount = currentRun!.tasks.filter(
        (t) => t.status === 'completed'
      ).length;
      const totalCount = currentRun!.tasks.length;

      Alert.alert(
        `Continue ${template.name}?`,
        `You made it through ${completedCount} of ${totalCount} tasks earlier. Pick up where you left off, or start fresh.`,
        [
          {
            text: 'Start Fresh',
            style: 'cancel',
            onPress: () => {
              const run = createRunFromTemplate(template, currentPace);
              setCurrentRun(run);
              setHasShownResumePrompt(true);
              router.push('/routine/run');
            },
          },
          {
            text: 'Continue',
            onPress: () => {
              const resumedRun = resumeAbandonedRun(currentRun!);
              setCurrentRun(resumedRun);
              setHasShownResumePrompt(true);
              router.push('/routine/run');
            },
          },
        ]
      );
      return;
    }

    const run = createRunFromTemplate(template, currentPace);
    setCurrentRun(run);
    setHasShownResumePrompt(true);
    router.push('/routine/run');
  };

  const handleEditRoutine = (template: RoutineTemplate) => {
    router.push(`/routine/${template.id}`);
  };

  const handleStartFocusItem = async (item: FocusItem) => {
    if (
      currentRun &&
      currentRun.status !== 'completed' &&
      currentRun.status !== 'abandoned'
    ) {
      Alert.alert(
        'Routine In Progress',
        `You have "${currentRun.templateName}" in progress. Do you want to discard it and start "${item.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Resume Current',
            onPress: () => router.push('/routine/run'),
          },
          {
            text: 'Start New',
            style: 'destructive',
            onPress: () => {
              const run = createRunFromFocusItem(item);
              setCurrentRun(run);
              setHasShownResumePrompt(true);
              startItemFocus(item.id);
              router.push('/routine/run');
            },
          },
        ]
      );
      return;
    }

    const run = createRunFromFocusItem(item);
    setCurrentRun(run);
    setHasShownResumePrompt(true);
    await startItemFocus(item.id);
    router.push('/routine/run');
  };

  const handleAddFocusItem = async (title: string, duration: any) => {
    await addToToday(title, duration);
  };

  const handleStartLaterItem = async (item: FocusItem) => {
    await moveToToday(item.id);
    if (isCheckOnceDue(item)) await triggerCheckOnce(item.id);
    await refreshItems();
    const updatedItem = todayItems.find((i) => i.id === item.id) || item;
    handleStartFocusItem(updatedItem);
  };

  // Empty day: Brain Dump bar auto-expands as the entry point
  const isEmptyDay = todayItems.length === 0 && !currentRun;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ── Fixed top area (doesn't scroll) ── */}
      <View
        style={[
          styles.topArea,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={[styles.header, { color: theme.colors.text }]}>
              Just Today
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              One step at a time
            </Text>
          </View>
          <PaceIndicator />
        </View>

        {/* Brain Dump capture bar */}
        <View style={styles.brainDumpBarWrapper}>
          <BrainDumpBar initiallyExpanded={isEmptyDay} />
        </View>

        {/* Tab switcher */}
        <View
          style={[
            styles.tabBar,
            { borderBottomColor: theme.colors.borderSubtle },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'focus' && {
                borderBottomColor: theme.colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab('focus')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    activeTab === 'focus'
                      ? theme.colors.primary
                      : theme.colors.textTertiary,
                  fontWeight: activeTab === 'focus' ? '600' : '400',
                },
              ]}
            >
              Focus
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'later' && {
                borderBottomColor: theme.colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab('later')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    activeTab === 'later'
                      ? theme.colors.primary
                      : theme.colors.textTertiary,
                  fontWeight: activeTab === 'later' ? '600' : '400',
                },
              ]}
            >
              Later
              {laterItems.length > 0 && (
                <Text
                  style={[
                    styles.tabBadge,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  {' '}
                  ({laterItems.length})
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scrollable tab content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'focus' ? (
          <>
            {/* Pace prompt banner */}
            {!hasSelectedForToday && <PacePromptBanner />}

            {/* Weekly intent banner */}
            {settings.weeklyIntentEnabled && <WeeklyIntentBanner />}

            {/* Optional pace picks */}
            <View style={styles.pacePicksSection}>
              <PacePicksCollapsible
                pace={currentPace}
                isExpanded={isEnergyMenuExpanded}
                onToggle={() =>
                  setIsEnergyMenuExpanded(!isEnergyMenuExpanded)
                }
                onAddItem={async (item) => {
                  await addToToday(
                    item.title,
                    item.estimatedDuration as any
                  );
                  setIsEnergyMenuExpanded(false);
                }}
              />
            </View>

            {/* Today's focus items */}
            <View style={styles.focusSection}>
              <TodaysFocus
                onStartFocus={handleStartFocusItem}
                onAddItem={() => setShowAddFocusModal(true)}
              />
            </View>

            {/* Routines */}
            <View style={styles.routinesSection}>
              <View style={styles.routinesHeader}>
                <SectionLabel>
                  {currentPace === 'low'
                    ? 'Essential Routines'
                    : currentPace === 'flow'
                    ? 'Full Routines'
                    : 'Routines'}
                </SectionLabel>
                <TouchableOpacity
                  style={[
                    styles.createButton,
                    {
                      backgroundColor: theme.colors.primarySubtle,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => router.push('/routine/new')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.createButtonText,
                      { color: theme.colors.text },
                    ]}
                  >
                    + New
                  </Text>
                </TouchableOpacity>
              </View>

              {templates.length === 0 ? (
                <View
                  style={[
                    styles.emptyState,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.borderSubtle,
                    },
                  ]}
                >
                  <Text style={styles.emptyIcon}>🌱</Text>
                  <Text
                    style={[styles.emptyText, { color: theme.colors.text }]}
                  >
                    Ready to start?
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtext,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Create your first routine to begin
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.emptyCreateButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => router.push('/routine/new')}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.emptyCreateButtonText,
                        { color: theme.colors.surface },
                      ]}
                    >
                      Create Your First Routine
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.routinesList}>
                  {templates.map((template) => (
                    <RoutineCard
                      key={template.id}
                      routine={template}
                      pace={currentPace}
                      canResume={canResumeAbandonedRun(currentRun, template.id)}
                      onStart={() => handleStartRoutine(template)}
                      onEdit={() => handleEditRoutine(template)}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Check-in indicator */}
            <View style={styles.checkInSection}>
              <CheckInIndicator onOpenFirstEntry={() => setShowFirstEntry(true)} />
            </View>

            {/* Resume routine banner - only for active/paused runs, not abandoned */}
            {currentRun && currentRun.status !== 'abandoned' && (
              <View style={styles.resumeSection}>
                <TouchableOpacity
                  style={[
                    styles.resumeButton,
                    {
                      backgroundColor: theme.colors.warningSubtle,
                      borderColor: theme.colors.warning,
                    },
                  ]}
                  onPress={() => router.push('/routine/run')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.resumeLabel,
                      { color: theme.colors.warning },
                    ]}
                  >
                    In Progress
                  </Text>
                  <Text
                    style={[styles.resumeText, { color: theme.colors.text }]}
                  >
                    {currentRun.templateName}
                  </Text>
                  <Text
                    style={[
                      styles.resumeAction,
                      { color: theme.colors.warning },
                    ]}
                  >
                    Tap to continue →
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          // ── Later tab ──
          <View style={styles.laterTab}>
            <LaterList
              onStartFocus={handleStartLaterItem}
              defaultExpanded
            />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Focus Item Modal */}
      <AddFocusItemModal
        visible={showAddFocusModal}
        onClose={() => setShowAddFocusModal(false)}
        onAdd={handleAddFocusItem}
        defaultLocation="today"
      />

      {/* Daily First-Entry Sheet */}
      <FirstEntrySheet
        visible={showFirstEntry}
        onClose={() => setShowFirstEntry(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Fixed top area
  topArea: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  header: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  brainDumpBarWrapper: {
    // No extra styles needed; BrainDumpBar handles its own sizing
  },
  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 15,
    letterSpacing: -0.1,
  },
  tabBadge: {
    fontSize: 13,
    fontWeight: '400',
  },
  // Scrollable content
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  pacePicksSection: {
    marginBottom: 20,
  },
  focusSection: {
    marginBottom: 32,
  },
  routinesSection: {
    gap: 16,
    marginBottom: 32,
  },
  routinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  emptyCreateButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    minWidth: 240,
  },
  emptyCreateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  routinesList: {
    gap: 12,
  },
  checkInSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  resumeSection: {
    marginTop: 8,
  },
  resumeButton: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  resumeLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resumeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  resumeAction: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  laterTab: {
    flex: 1,
  },
  bottomSpacer: {
    height: 20,
  },
});
