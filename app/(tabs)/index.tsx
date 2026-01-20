/**
 * index.tsx
 * Home/Today screen - shows energy indicator and starts routines.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { RoutineTemplate } from '../../src/models/RoutineTemplate';
import { loadTemplates } from '../../src/persistence/templateStore';
import { createRunFromTemplate, createRunFromFocusItem, canResumeAbandonedRun, resumeAbandonedRun } from '../../src/engine/runEngine';
import { useRun } from '../../src/context/RunContext';
import { useFocus } from '../../src/context/FocusContext';
import { useEnergy } from '../../src/context/EnergyContext';
import { useTheme } from '../../src/constants/theme';
import { EnergyIndicator } from '../../src/components/EnergyIndicator';
import { RoutineCard } from '../../src/components/RoutineCard';
import { EnergyMenuCollapsible } from '../../src/components/EnergyMenuCollapsible';
import { TodaysFocus } from '../../src/components/TodaysFocus';
import { LaterList } from '../../src/components/LaterList';
import { BrainDump } from '../../src/components/BrainDump';
import { AddFocusItemModal } from '../../src/components/AddFocusItemModal';
import { FocusItem } from '../../src/models/FocusItem';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { setCurrentRun, currentRun } = useRun();
  const { startItemFocus, addToToday, refreshItems } = useFocus();
  const { currentMode: energyMode } = useEnergy();
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [hasShownResumePrompt, setHasShownResumePrompt] = useState(false);
  const [showAddFocusModal, setShowAddFocusModal] = useState(false);
  const [isBrainDumpExpanded, setIsBrainDumpExpanded] = useState(false);
  const [isEnergyMenuExpanded, setIsEnergyMenuExpanded] = useState(false);
  const [isRoutinesExpanded, setIsRoutinesExpanded] = useState(false);

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
    }, [refreshItems])
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
              const run = createRunFromTemplate(template, energyMode);
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
              const run = createRunFromTemplate(template, energyMode);
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

    const run = createRunFromTemplate(template, energyMode);
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

  // Routines collapsible logic - show 1-2 routines by default
  const VISIBLE_ROUTINES_LIMIT = 2;
  const hasMoreRoutines = templates.length > VISIBLE_ROUTINES_LIMIT;
  const visibleRoutines = isRoutinesExpanded ? templates : templates.slice(0, VISIBLE_ROUTINES_LIMIT);
  const hiddenRoutinesCount = templates.length - VISIBLE_ROUTINES_LIMIT;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Gentle, supportive header with energy indicator */}
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
            <EnergyIndicator />
          </View>
        </View>

        {/* 2. Optional Energy Menu (collapsed by default) */}
        <View style={styles.energyMenuSection}>
          <EnergyMenuCollapsible
            energyMode={energyMode}
            isExpanded={isEnergyMenuExpanded}
            onToggle={() => setIsEnergyMenuExpanded(!isEnergyMenuExpanded)}
            onAddItem={async (item) => {
              await addToToday(item.title, item.estimatedDuration as any);
              setIsEnergyMenuExpanded(false);
            }}
          />
        </View>

        {/* 3. Today's Focus Section (primary action area) */}
        <View style={styles.focusSection}>
          <TodaysFocus
            onStartFocus={handleStartFocusItem}
            onAddItem={() => setShowAddFocusModal(true)}
          />
        </View>

        {/* 4. Routines section */}
        <View style={styles.routinesSection}>
          <View style={styles.routinesHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {energyMode === 'low' && 'Your Essential Routines'}
                {energyMode === 'steady' && 'Your Routines'}
                {energyMode === 'flow' && 'Your Full Routines'}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                {energyMode === 'low' && 'Just the essentials'}
                {energyMode === 'steady' && 'Your usual pace'}
                {energyMode === 'flow' && 'Everything included'}
              </Text>
            </View>
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
              {visibleRoutines.map((template) => (
                <RoutineCard
                  key={template.id}
                  routine={template}
                  energyMode={energyMode}
                  onStart={() => handleStartRoutine(template)}
                  onEdit={() => handleEditRoutine(template)}
                />
              ))}

              {/* Expand/Collapse affordance */}
              {hasMoreRoutines && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => setIsRoutinesExpanded(!isRoutinesExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllText, { color: theme.colors.textSecondary }]}>
                    {isRoutinesExpanded ? 'Show less' : 'View all routines'}
                  </Text>
                </TouchableOpacity>
              )}
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
  energyMenuSection: {
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
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
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
  viewAllButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.1,
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
