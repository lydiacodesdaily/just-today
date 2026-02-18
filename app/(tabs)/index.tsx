/**
 * index.tsx
 * Home/Today screen - shows pace indicator and starts routines.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { RoutineTemplate } from '../../src/models/RoutineTemplate';
import { loadTemplates } from '../../src/persistence/templateStore';
import { createRunFromTemplate, createRunFromFocusItem, canResumeAbandonedRun, resumeAbandonedRun } from '../../src/engine/runEngine';
import { useRun } from '../../src/context/RunContext';
import { useFocus } from '../../src/context/FocusContext';
import { usePace } from '../../src/context/PaceContext';
import { useTheme } from '../../src/constants/theme';
import { PaceIndicator } from '../../src/components/PaceIndicator';
import { RoutineCard } from '../../src/components/RoutineCard';
import { PacePicksCollapsible } from '../../src/components/PacePicksCollapsible';
import { TodaysFocus } from '../../src/components/TodaysFocus';
import { LaterList } from '../../src/components/LaterList';
import { BrainDump } from '../../src/components/BrainDump';
import { DaylineCapture } from '../../src/components/DaylineCapture';
import { AddFocusItemModal } from '../../src/components/AddFocusItemModal';
import { SectionLabel } from '../../src/components/SectionLabel';
import { FocusItem } from '../../src/models/FocusItem';
import { CaptureScreen } from '../../src/components/CaptureScreen';
import { RoutinePickerSheet } from '../../src/components/RoutinePickerSheet';
import { PickOneThingSheet } from '../../src/components/PickOneThingSheet';
import { PacePick } from '../../src/models/PacePick';
import { getPacePicksByPace } from '../../src/persistence/pacePicksStore';
import { moveToToday, triggerCheckOnce } from '../../src/persistence/focusStore';
import { isCheckOnceDue } from '../../src/models/FocusItem';
import { PacePromptBanner } from '../../src/components/PacePromptBanner';
import { WeeklyIntentBanner } from '../../src/components/WeeklyIntentBanner';
import { useSettings } from '../../src/context/SettingsContext';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { setCurrentRun, currentRun } = useRun();
  const { todayItems, laterItems, startItemFocus, addToToday, refreshItems } = useFocus();
  const { currentPace, hasSelectedForToday } = usePace();
  const { settings } = useSettings();
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [hasShownResumePrompt, setHasShownResumePrompt] = useState(false);
  const [showAddFocusModal, setShowAddFocusModal] = useState(false);
  const [showRoutinePicker, setShowRoutinePicker] = useState(false);
  const [showPickOneThing, setShowPickOneThing] = useState(false);
  const [pacePicks, setPacePicks] = useState<PacePick[]>([]);
  const [isBrainDumpExpanded, setIsBrainDumpExpanded] = useState(false);
  const [isDaylineExpanded, setIsDaylineExpanded] = useState(false);
  const [isEnergyMenuExpanded, setIsEnergyMenuExpanded] = useState(false);
  const [forceShowTodayView, setForceShowTodayView] = useState(false);

  // Prompt user to resume or discard saved run
  useEffect(() => {
    if (currentRun && !hasShownResumePrompt && currentRun.status !== 'completed' && currentRun.status !== 'abandoned') {
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

  // Reload templates whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTemplates()
        .then(setTemplates)
        .catch((err) => {
          console.error('Failed to load templates:', err);
          setTemplates([]);
        });

      // Refresh optional items as well
      refreshItems();

      // Load extras filtered by current pace
      getPacePicksByPace(currentPace)
        .then(setPacePicks)
        .catch((err) => {
          console.error('Failed to load extras:', err);
          setPacePicks([]);
        });
    }, [refreshItems, currentPace])
  );

  const handleStartRoutine = (template: RoutineTemplate) => {
    // Check if there's already a routine in progress
    if (currentRun && currentRun.status !== 'completed' && currentRun.status !== 'abandoned') {
      Alert.alert(
        'Routine In Progress',
        `You have "${currentRun.templateName}" in progress. Do you want to discard it and start "${template.name}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
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
              setHasShownResumePrompt(true); // Mark as shown since we're actively starting
              router.push('/routine/run');
            },
          },
        ]
      );
      return;
    }

    // Check if there's an abandoned run from today for the same routine
    if (canResumeAbandonedRun(currentRun, template.id)) {
      const completedCount = currentRun!.tasks.filter((t) => t.status === 'completed').length;
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
    setHasShownResumePrompt(true); // Mark as shown since we're actively starting
    router.push('/routine/run');
  };

  const handleEditRoutine = (template: RoutineTemplate) => {
    router.push(`/routine/${template.id}`);
  };

  const handleStartFocusItem = async (item: FocusItem) => {
    // Check if there's already a routine in progress
    if (currentRun && currentRun.status !== 'completed' && currentRun.status !== 'abandoned') {
      Alert.alert(
        'Routine In Progress',
        `You have "${currentRun.templateName}" in progress. Do you want to discard it and start "${item.title}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
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

    // Create a single-task run from the focus item
    const run = createRunFromFocusItem(item);
    setCurrentRun(run);
    setHasShownResumePrompt(true);
    await startItemFocus(item.id);
    router.push('/routine/run');
  };

  const handleAddFocusItem = async (title: string, duration: any) => {
    await addToToday(title, duration);
  };

  const handleStartLaterItem = async (item: FocusItem, reason: string) => {
    // Move item from Later to Today
    await moveToToday(item.id);

    // If it's a circle back item, trigger it to prevent re-showing
    if (isCheckOnceDue(item)) {
      await triggerCheckOnce(item.id);
    }

    // Refresh to get updated item
    await refreshItems();

    // Find the item in todayItems after refresh
    const updatedItem = todayItems.find((i) => i.id === item.id) || item;

    // Start the focus session
    setShowPickOneThing(false);
    handleStartFocusItem(updatedItem);
  };

  const handleStartPacePick = async (pacePick: PacePick) => {
    // Add pace pick to Today
    const newItem = await addToToday(
      pacePick.title,
      pacePick.estimatedDuration || '~15 min'
    );

    // Close modal and start the focus session
    setShowPickOneThing(false);
    handleStartFocusItem(newItem);
  };

  // Phase 1 UX redesign: Show all routines (no more "View all" anxiety)

  // Phase 2 UX redesign: Show CaptureScreen when no items committed for today
  if (todayItems.length === 0 && !currentRun && !forceShowTodayView) {
    return (
      <>
        <CaptureScreen
          onPickItem={() => setShowPickOneThing(true)}
          onStartRoutine={() => setShowRoutinePicker(true)}
          onViewToday={() => setForceShowTodayView(true)}
        />
        <PickOneThingSheet
          visible={showPickOneThing}
          onClose={() => setShowPickOneThing(false)}
          laterItems={laterItems}
          pacePicks={pacePicks}
          onStartLaterItem={handleStartLaterItem}
          onStartPacePick={handleStartPacePick}
          onAddCustom={() => setShowAddFocusModal(true)}
        />
        <AddFocusItemModal
          visible={showAddFocusModal}
          onClose={() => setShowAddFocusModal(false)}
          onAdd={handleAddFocusItem}
          defaultLocation="today"
        />
        <RoutinePickerSheet
          visible={showRoutinePicker}
          onClose={() => setShowRoutinePicker(false)}
          routines={templates}
          onStartRoutine={(routine) => {
            setShowRoutinePicker(false);
            handleStartRoutine(routine);
          }}
          onCreateRoutine={() => {
            setShowRoutinePicker(false);
            router.push('/routine/new');
          }}
        />
      </>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Gentle, supportive header with pace indicator */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={[styles.header, { color: theme.colors.text }]}>
                Just Today
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                One step at a time
              </Text>
            </View>
            <PaceIndicator />
          </View>
        </View>

        {/* Pace prompt banner - shows when user hasn't selected pace for today */}
        {!hasSelectedForToday && <PacePromptBanner />}

        {/* Weekly intent banner - shows when weekly planning is enabled */}
        {settings.weeklyIntentEnabled && <WeeklyIntentBanner />}

        {/* 2. Optional Extras (collapsed by default) */}
        <View style={styles.pacePicksSection}>
          <PacePicksCollapsible
            pace={currentPace}
            isExpanded={isEnergyMenuExpanded}
            onToggle={() => setIsEnergyMenuExpanded(!isEnergyMenuExpanded)}
            onAddItem={async (item) => {
              await addToToday(item.title, item.estimatedDuration as any);
              setIsEnergyMenuExpanded(false);
            }}
          />
        </View>

        {/* 3. Today Section (primary action area) */}
        <View style={styles.focusSection}>
          <TodaysFocus
            onStartFocus={handleStartFocusItem}
            onAddItem={() => setShowAddFocusModal(true)}
          />
        </View>

        {/* 4. Routines section - Phase 1: 11px caps label */}
        <View style={styles.routinesSection}>
          <View style={styles.routinesHeader}>
            <SectionLabel>
              {currentPace === 'low' ? 'Essential Routines' : currentPace === 'flow' ? 'Full Routines' : 'Routines'}
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
              <Text style={[styles.createButtonText, { color: theme.colors.text }]}>
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
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                Ready to start?
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Create your first routine to begin
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyCreateButton,
                  {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() => router.push('/routine/new')}
                activeOpacity={0.8}
              >
                <Text style={[styles.emptyCreateButtonText, { color: theme.colors.surface }]}>
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
                  onStart={() => handleStartRoutine(template)}
                  onEdit={() => handleEditRoutine(template)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Visual separator between "Doing" and "Thinking" */}
        <View style={styles.sectionDivider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.borderSubtle }]} />
          <Text style={[styles.dividerLabel, { color: theme.colors.textSecondary }]}>
            Later & Ideas
          </Text>
        </View>

        {/* 5. Later Section (collapsed by default) */}
        <View style={styles.laterSection}>
          <LaterList onStartFocus={handleStartFocusItem} />
        </View>

        {/* 6. Brain Dump Section (collapsed, secondary) */}
        <View style={styles.brainDumpSection}>
          <BrainDump
            isExpanded={isBrainDumpExpanded}
            onToggle={() => setIsBrainDumpExpanded(!isBrainDumpExpanded)}
          />
        </View>

        {/* 7. Dayline Section (collapsed, for memory capture) */}
        <View style={styles.daylineSection}>
          <DaylineCapture
            isExpanded={isDaylineExpanded}
            onToggle={() => setIsDaylineExpanded(!isDaylineExpanded)}
          />
        </View>

        {/* Resume button - gentle but present */}
        {currentRun && (
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
              <Text style={[styles.resumeLabel, { color: theme.colors.warning }]}>
                In Progress
              </Text>
              <Text style={[styles.resumeText, { color: theme.colors.text }]}>
                {currentRun.templateName}
              </Text>
              <Text style={[styles.resumeAction, { color: theme.colors.warning }]}>
                Tap to continue →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Spacer for bottom padding */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Focus Item Modal */}
      <AddFocusItemModal
        visible={showAddFocusModal}
        onClose={() => setShowAddFocusModal(false)}
        onAdd={handleAddFocusItem}
        defaultLocation="today"
      />
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerSection: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  pacePicksSection: {
    marginBottom: 20,
  },
  focusSection: {
    marginBottom: 32,
  },
  sectionDivider: {
    marginVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    height: 1,
    width: '100%',
    opacity: 0.3,
  },
  dividerLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  laterSection: {
    marginBottom: 24,
  },
  brainDumpSection: {
    marginBottom: 24,
  },
  daylineSection: {
    marginBottom: 32,
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
  optionalSection: {
    marginBottom: 24,
    gap: 12,
  },
  optionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionalTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionalEditLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionalItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  optionalItemContent: {
    gap: 4,
  },
  optionalItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  optionalItemDuration: {
    fontSize: 14,
  },
  routinesSection: {
    gap: 16,
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
  resumeSection: {
    marginTop: 24,
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
  bottomSpacer: {
    height: 20,
  },
});
