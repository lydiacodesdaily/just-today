/**
 * routine/run.tsx
 * Running screen - active routine execution.
 */

import React, { useEffect } from 'react';
import { StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
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

  // Initialize audio on mount
  useEffect(() => {
    const init = async () => {
      await initAudio();
      initTTS();
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

  const activeTask = currentRun.tasks.find((t) => t.id === currentRun.activeTaskId);
  const isPaused = currentRun.status === 'paused';
  const timeRemaining = useTimer(activeTask || null, isPaused, currentRun.pausedAt);

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

  // Setup audio hooks
  useAudio({
    activeTask: activeTask || null,
    timeRemaining,
    settings,
    isPaused,
    onOvertimeAnnounced: handleOvertimeAnnounced,
  });

  const handlePause = () => {
    pauseCurrentRun();
  };

  const handleResume = () => {
    resumeCurrentRun();
  };

  const handleSkip = () => {
    if (activeTask) {
      advanceTask();
    }
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
    if (currentRun.status === 'completed' || currentRun.status === 'abandoned') {
      Alert.alert(
        'Routine Complete',
        'You finished your routine!',
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
  }, [currentRun.status]);

  if (!activeTask) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
  scrollView: {
    flex: 1,
  },
});
