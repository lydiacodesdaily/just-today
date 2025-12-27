/**
 * useTaskTransition.ts
 * Hook to automatically advance to the next task when timer reaches 0,
 * but only if the task has autoAdvance enabled.
 * Also handles 1-minute warnings for auto-advancing tasks.
 */

import { useEffect, useRef } from 'react';
import { RoutineRun, RunTask } from '../models/RoutineRun';
import { TimeRemaining } from '../engine/timerEngine';
import { getAutoAdvanceWarningMessage } from '../utils/transitionMessages';
import { speak } from '../audio/ttsEngine';
import { sendTimeMilestoneNotification } from '../utils/notifications';

interface UseTaskTransitionProps {
  activeTask: RunTask | null;
  timeRemaining: TimeRemaining | null;
  isPaused: boolean;
  currentRun: RoutineRun | null;
  onAdvanceTask: () => void;
  onWarningAnnounced: () => void;
}

/**
 * Monitors the timer and:
 * 1. Announces 1-minute warning for tasks with autoAdvance enabled
 * 2. Automatically advances to the next task when timer reaches 0 (if autoAdvance is true)
 */
export function useTaskTransition({
  activeTask,
  timeRemaining,
  isPaused,
  currentRun,
  onAdvanceTask,
  onWarningAnnounced,
}: UseTaskTransitionProps): void {
  const hasAdvancedRef = useRef(false);
  const previousTaskIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset the advance flag when task changes
    if (activeTask?.id !== previousTaskIdRef.current) {
      hasAdvancedRef.current = false;
      previousTaskIdRef.current = activeTask?.id || null;
    }
  }, [activeTask?.id]);

  useEffect(() => {
    if (!activeTask || !timeRemaining || isPaused || !currentRun) {
      return;
    }

    // Check for 1-minute warning (only for auto-advance tasks)
    if (
      activeTask.autoAdvance &&
      !activeTask.autoAdvanceWarningAnnounced &&
      timeRemaining.remainingMs > 0 &&
      timeRemaining.remainingMs <= 60000 // 1 minute or less
    ) {
      // Find the next task
      const nextTask = currentRun.tasks
        .filter((t) => t.status === 'pending')
        .sort((a, b) => a.order - b.order)[0];

      if (nextTask) {
        const warningMessage = getAutoAdvanceWarningMessage(
          activeTask.name,
          nextTask.name
        );

        // Send voice announcement
        speak(warningMessage.ttsMessage);

        // Send notification
        sendTimeMilestoneNotification(activeTask.name, 1);

        // Mark warning as announced
        onWarningAnnounced();
      }
    }

    // Check if time has reached 0 and task has auto-advance enabled
    if (
      activeTask.autoAdvance &&
      timeRemaining.totalMs <= 0 &&
      !hasAdvancedRef.current
    ) {
      hasAdvancedRef.current = true;
      onAdvanceTask();
    }
  }, [
    activeTask,
    timeRemaining,
    isPaused,
    currentRun,
    onAdvanceTask,
    onWarningAnnounced,
  ]);
}
