/**
 * routine/run.tsx
 * Running screen - active routine execution.
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Alert, SafeAreaView, ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { CheckInSheet } from '../../src/components/CheckInSheet';
import { useRouter } from 'expo-router';
import { useRun } from '../../src/context/RunContext';
import { useFocus } from '../../src/context/FocusContext';
import { useSettings } from '../../src/context/SettingsContext';
import { useTimer } from '../../src/hooks/useTimer';
import { useAudio } from '../../src/hooks/useAudio';
import { useTheme } from '../../src/constants/theme';
import { TaskCard } from '../../src/components/TaskCard';
import { TaskControls } from '../../src/components/TaskControls';
import { QueueList } from '../../src/components/QueueList';
import { QuickSoundControls } from '../../src/components/QuickSoundControls';
import { markOvertimeAnnounced } from '../../src/engine/overtimeEngine';
import { initAudio } from '../../src/audio/soundEngine';
import { initTTS } from '../../src/audio/ttsEngine';
import { requestNotificationPermissions } from '../../src/utils/notifications';
import { useTaskTransition } from '../../src/hooks/useTaskTransition';
import { useTimeMilestones } from '../../src/hooks/useTimeMilestones';

export default function RunScreen() {
  const theme = useTheme();
  const router = useRouter();
  const completionAlertShown = useRef(false);
  const [showCheckInSheet, setShowCheckInSheet] = useState(false);
  const {
    currentRun,
    setCurrentRun,
    startCurrentRun,
    pauseCurrentRun,
    resumeCurrentRun,
    endCurrentRun,
    advanceTask,
    skipCurrentTask,
    extendCurrentTask,
    moveCurrentTask,
    toggleTaskSubtask,
    toggleTaskAutoAdvance,
  } = useRun();
  const { completeItem: completeFocusItem, endItemFocus } = useFocus();
  const { settings } = useSettings();

  // Initialize audio and notifications on mount
  useEffect(() => {
    const init = async () => {
      await initAudio();
      initTTS();
      await requestNotificationPermissions();
    };
    init();
  }, []);

  // Redirect if no run
  useEffect(() => {
    if (!currentRun) {
      router.replace('/');
    }
  }, [currentRun, router]);

  // Auto-start run if not started
  useEffect(() => {
    if (currentRun && currentRun.status === 'notStarted') {
      startCurrentRun();
    }
  }, [currentRun, startCurrentRun]);

  // Calculate active task and timer state before any early returns
  const activeTask = currentRun?.tasks.find((t) => t.id === currentRun.activeTaskId);
  const isPaused = currentRun?.status === 'paused';
  const timeRemaining = useTimer(activeTask || null, isPaused || false, currentRun?.pausedAt);

  // Handle overtime announcements
  const handleOvertimeAnnounced = (minutes: number) => {
    if (activeTask && currentRun) {
      const updatedTask = markOvertimeAnnounced(activeTask, minutes);
      const updatedTasks = currentRun.tasks.map((t) =>
        t.id === updatedTask.id ? updatedTask : t
      );
      setCurrentRun({ ...currentRun, tasks: updatedTasks });
    }
  };

  // Handle time milestone announcements
  const handleMilestoneAnnounced = (minutes: number) => {
    if (activeTask && currentRun) {
      const updatedTask = {
        ...activeTask,
        milestoneAnnouncedMinutes: [...activeTask.milestoneAnnouncedMinutes, minutes],
      };
      const updatedTasks = currentRun.tasks.map((t) =>
        t.id === updatedTask.id ? updatedTask : t
      );
      setCurrentRun({ ...currentRun, tasks: updatedTasks });
    }
  };

  // Handle auto-advance warning announcement
  const handleAutoAdvanceWarning = () => {
    if (activeTask && currentRun) {
      const updatedTask = {
        ...activeTask,
        autoAdvanceWarningAnnounced: true,
      };
      const updatedTasks = currentRun.tasks.map((t) =>
        t.id === updatedTask.id ? updatedTask : t
      );
      setCurrentRun({ ...currentRun, tasks: updatedTasks });
    }
  };

  // Handle time up announcement (for non-auto-advance tasks)
  const handleTimeUpAnnouncement = () => {
    if (activeTask && currentRun) {
      const updatedTask = {
        ...activeTask,
        timeUpAnnounced: true,
      };
      const updatedTasks = currentRun.tasks.map((t) =>
        t.id === updatedTask.id ? updatedTask : t
      );
      setCurrentRun({ ...currentRun, tasks: updatedTasks });
    }
  };

  // Setup audio hooks - MUST be called before any conditional returns
  useAudio({
    activeTask: activeTask || null,
    timeRemaining,
    settings,
    isPaused,
    onOvertimeAnnounced: handleOvertimeAnnounced,
  });

  // Auto-advance when timer reaches 0 (only for tasks with autoAdvance enabled)
  useTaskTransition({
    activeTask: activeTask || null,
    timeRemaining,
    isPaused,
    currentRun,
    onAdvanceTask: advanceTask,
    onWarningAnnounced: handleAutoAdvanceWarning,
    onTimeUpAnnounced: handleTimeUpAnnouncement,
  });

  // Announce time milestones during task
  useTimeMilestones({
    activeTask: activeTask || null,
    timeRemaining,
    isPaused,
    milestoneInterval: settings.milestoneInterval,
    onMilestoneAnnounced: handleMilestoneAnnounced,
  });

  // Lifted completion handler — also called from CheckInSheet onClose
  const handleRunComplete = async () => {
    if (!currentRun) return;
    const isFocusItemRun = currentRun.templateId === 'focus-item';
    if (isFocusItemRun && currentRun.tasks[0]?.templateTaskId) {
      const focusItemId = currentRun.tasks[0].templateTaskId;
      await completeFocusItem(focusItemId);
      await endItemFocus(focusItemId);
    }
    setCurrentRun(null);
    router.replace('/');
  };

  // Check if run is completed
  useEffect(() => {
    if (currentRun?.status === 'completed' && !completionAlertShown.current) {
      completionAlertShown.current = true;
      const isFocusItem = currentRun.templateId === 'focus-item';

      if (isFocusItem) {
        // Single-task focus item: brief alert then navigate
        Alert.alert(
          "That's it.",
          "You completed this task.\n\nYou don't have to do anything else right now.",
          [{ text: 'Back to Today', onPress: handleRunComplete }]
        );
      } else {
        // Full routine: show check-in sheet before navigating away
        setShowCheckInSheet(true);
      }
    } else if (currentRun?.status === 'abandoned') {
      // If this was a focus item run, just end the session (don't complete)
      const handleAbandon = async () => {
        if (currentRun.templateId === 'focus-item' && currentRun.tasks[0]?.templateTaskId) {
          const focusItemId = currentRun.tasks[0].templateTaskId;
          await endItemFocus(focusItemId);
        }

        setCurrentRun(null);
        router.replace('/');
      };

      Alert.alert(
        'Routine Ended',
        "That's okay. You can try again whenever you're ready.",
        [
          {
            text: 'Done',
            onPress: handleAbandon,
          },
        ]
      );
    }
  }, [currentRun?.status, completeFocusItem, endItemFocus, setCurrentRun, router]);

  // Early returns AFTER all hooks have been called
  if (!currentRun || !activeTask) {
    return null;
  }

  const handlePause = () => {
    pauseCurrentRun();
  };

  const handleResume = () => {
    resumeCurrentRun();
  };

  const handleComplete = () => {
    if (activeTask) {
      advanceTask();
    }
  };

  const handleSkip = () => {
    if (activeTask) {
      skipCurrentTask(activeTask.id);
    }
  };

  const handleBack = () => {
    if (!isPaused) {
      pauseCurrentRun();
    }
    router.back();
  };

  const handleExtend = (ms: number) => {
    if (activeTask) {
      extendCurrentTask(activeTask.id, ms);
    }
  };

  const handleEnd = () => {
    Alert.alert(
      'End Routine',
      'Are you sure you want to end this routine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: () => {
            endCurrentRun();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleToggleSubtask = (subtaskId: string) => {
    if (activeTask) {
      toggleTaskSubtask(activeTask.id, subtaskId);
    }
  };

  const handleToggleAutoAdvance = () => {
    if (activeTask) {
      toggleTaskAutoAdvance(activeTask.id);
    }
  };

  // Calculate progress
  const completedTasks = currentRun.tasks.filter(t => t.status === 'completed' || t.status === 'skipped').length;
  const totalTasks = currentRun.tasks.length;
  const isFocusItem = currentRun.templateId === 'focus-item';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with back navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <View style={styles.routineInfo}>
          <Text style={[styles.routineName, { color: theme.colors.text }]}>
            {isFocusItem ? 'Today Focus' : currentRun.templateName}
          </Text>
          {!isFocusItem && (
            <Text style={[styles.routineProgress, { color: theme.colors.textSecondary }]}>
              {completedTasks + 1} of {totalTasks} tasks
            </Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <TaskCard
          task={activeTask}
          timeRemaining={timeRemaining}
          onToggleSubtask={handleToggleSubtask}
        />

        <TaskControls
          isPaused={isPaused}
          isAutoAdvance={activeTask?.autoAdvance || false}
          onPause={handlePause}
          onResume={handleResume}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onExtend={handleExtend}
          onEnd={handleEnd}
          onToggleAutoAdvance={handleToggleAutoAdvance}
        />

        {/* Simple sound controls - always visible, calm and unobtrusive */}
        <QuickSoundControls />

        <QueueList
          tasks={currentRun.tasks}
          onMoveUp={(id) => moveCurrentTask(id, 'up')}
          onMoveDown={(id) => moveCurrentTask(id, 'down')}
          onMoveToNext={(id) => moveCurrentTask(id, 'next')}
          onMoveToEnd={(id) => moveCurrentTask(id, 'end')}
          onSkip={skipCurrentTask}
        />
      </ScrollView>

      {/* Check-in sheet shown after routine (not focus item) completes */}
      <CheckInSheet
        visible={showCheckInSheet}
        title="How did that go?"
        onClose={() => {
          setShowCheckInSheet(false);
          handleRunComplete();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  routineInfo: {
    alignItems: 'center',
    gap: 2,
  },
  routineName: {
    fontSize: 18,
    fontWeight: '600',
  },
  routineProgress: {
    fontSize: 13,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
});
