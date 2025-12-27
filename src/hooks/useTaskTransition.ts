/**
 * useTaskTransition.ts
 * Hook to automatically advance to the next task when timer reaches 0,
 * but only if the task has autoAdvance enabled.
 * Also handles 1-minute warnings for auto-advancing tasks.
 * For non-auto-advance tasks, announces when time is up via TTS and notification.
 */

import { useEffect, useRef } from 'react';
import { RoutineRun, RunTask } from '../models/RoutineRun';
import { TimeRemaining } from '../engine/timerEngine';
import { getAutoAdvanceWarningMessage, getTaskCompletionMessage } from '../utils/transitionMessages';
import { speak } from '../audio/ttsEngine';
import { sendTimeMilestoneNotification, sendTaskTransitionNotification } from '../utils/notifications';

interface UseTaskTransitionProps {
  activeTask: RunTask | null;
  timeRemaining: TimeRemaining | null;
  isPaused: boolean;
  currentRun: RoutineRun | null;
  onAdvanceTask: () => void;
  onWarningAnnounced: () => void;
  onTimeUpAnnounced?: () => void;
}

/**
 * Monitors the timer and:
 * 1. Announces 1-minute warning for tasks with autoAdvance enabled
 * 2. Automatically advances to the next task when timer reaches 0 (if autoAdvance is true)
 * 3. Announces when time is up for non-auto-advance tasks
 */
export function useTaskTransition({
  activeTask,
  timeRemaining,
  isPaused,
  currentRun,
  onAdvanceTask,
  onWarningAnnounced,
  onTimeUpAnnounced,
}: UseTaskTransitionProps): void {
  const hasAdvancedRef = useRef(false);
  const previousTaskIdRef = useRef<string | null>(null);
  const previousTimeRemainingRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset the advance flag when task changes
    if (activeTask?.id !== previousTaskIdRef.current) {
      hasAdvancedRef.current = false;
      previousTaskIdRef.current = activeTask?.id || null;
      previousTimeRemainingRef.current = null;
    }
  }, [activeTask?.id]);

  useEffect(() => {
    if (!activeTask || !timeRemaining || isPaused || !currentRun) {
      return;
    }

    // Track the previous time remaining
    const previousTime = previousTimeRemainingRef.current;
    previousTimeRemainingRef.current = timeRemaining.totalMs;

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

    // Check if time has reached 0
    // Only trigger if we've been running for at least 1 second (prevents false triggers on task start)
    const hasBeenRunning = timeRemaining.elapsedMs >= 1000;

    // Check if we're transitioning from positive to zero/negative (crossing the zero threshold)
    const isTransitioningToZero = previousTime !== null && previousTime > 0 && timeRemaining.totalMs <= 0;

    // Only announce when we're actually crossing from positive to zero/negative
    if (timeRemaining.totalMs <= 0 && hasBeenRunning && !hasAdvancedRef.current && !activeTask.timeUpAnnounced && isTransitioningToZero) {
      if (activeTask.autoAdvance) {
        // Auto-advance: the advanceTask function will handle TTS/notifications
        hasAdvancedRef.current = true;
        onAdvanceTask();
      } else {
        // Non-auto-advance: announce that time is up
        // Find the next task
        const nextTask = currentRun.tasks
          .filter((t) => t.status === 'pending')
          .sort((a, b) => a.order - b.order)[0];

        if (nextTask) {
          const completionMessage = getTaskCompletionMessage(
            activeTask.name,
            nextTask.name
          );
          speak(completionMessage.ttsMessage);
          sendTaskTransitionNotification(activeTask.name, nextTask.name);
        } else {
          // Last task - just announce completion
          const message = `${activeTask.name} is complete. You can move on when you're ready.`;
          speak(message);
          sendTaskTransitionNotification(activeTask.name, 'Next task');
        }

        // Notify parent to mark time up as announced
        if (onTimeUpAnnounced) {
          onTimeUpAnnounced();
        }
      }
    }
  }, [
    activeTask,
    timeRemaining,
    isPaused,
    currentRun,
    onAdvanceTask,
    onWarningAnnounced,
    onTimeUpAnnounced,
  ]);
}
