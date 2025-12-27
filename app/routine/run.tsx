/**
 * routine/run.tsx
 * Running screen - active routine execution.
 */

import React, { useEffect } from 'react';
import { StyleSheet, Alert, SafeAreaView, ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useRun } from '../../src/context/RunContext';
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
import { getRoutineCompleteMessage } from '../../src/utils/transitionMessages';
import { useTaskTransition } from '../../src/hooks/useTaskTransition';
import { useTimeMilestones } from '../../src/hooks/useTimeMilestones';

export default function RunScreen() {
  const theme = useTheme();
  const router = useRouter();
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
  } = useRun();
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

  // Auto-advance when task completes naturally
  useEffect(() => {
    if (!currentRun || !activeTask || !timeRemaining) {
      return;
    }

    // Don't auto-advance, user must manually advance or skip
    // (This allows for overtime without forcing the next task)
  }, []);

  if (!currentRun) {
    return null;
  }

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

  // Setup audio hooks
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
  });

  // Announce time milestones during task
  useTimeMilestones({
    activeTask: activeTask || null,
    timeRemaining,
    isPaused,
    milestoneInterval: settings.milestoneInterval,
    onMilestoneAnnounced: handleMilestoneAnnounced,
  });

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

  // Check if run is completed
  useEffect(() => {
    if (currentRun?.status === 'completed') {
      const completeMessage = getRoutineCompleteMessage();
      Alert.alert(
        'You did it!',
        completeMessage.displayMessage,
        [
          {
            text: 'Done',
            onPress: () => {
              setCurrentRun(null);
              router.replace('/');
            },
          },
        ]
      );
    } else if (currentRun?.status === 'abandoned') {
      Alert.alert(
        'Routine Ended',
        "That's okay. You can try again whenever you're ready.",
        [
          {
            text: 'Done',
            onPress: () => {
              setCurrentRun(null);
              router.replace('/');
            },
          },
        ]
      );
    }
  }, [currentRun?.status]);

  if (!currentRun || !activeTask) {
    return null;
  }

  // Calculate progress
  const completedTasks = currentRun.tasks.filter(t => t.status === 'completed' || t.status === 'skipped').length;
  const totalTasks = currentRun.tasks.length;

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
            {currentRun.templateName}
          </Text>
          <Text style={[styles.routineProgress, { color: theme.colors.textSecondary }]}>
            {completedTasks + 1} of {totalTasks} tasks
          </Text>
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
          onPause={handlePause}
          onResume={handleResume}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onExtend={handleExtend}
          onEnd={handleEnd}
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
