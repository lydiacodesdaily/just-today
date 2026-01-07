/**
 * useTaskTransition.ts
 * Hook to automatically advance to the next task when timer reaches 0,
 * but only if the task has autoAdvance enabled.
 * Web version: simplified without TTS/notifications for now
 */

import { useEffect, useRef } from 'react';
import { RoutineRun, RunTask } from '@/src/models/RoutineRun';
import { TimeRemaining } from '@/src/engine/timerEngine';

interface UseTaskTransitionProps {
  activeTask: RunTask | null;
  timeRemaining: TimeRemaining | null;
  isPaused: boolean;
  currentRun: RoutineRun | null;
  onAdvanceTask: () => void;
}

/**
 * Monitors the timer and automatically advances to the next task when timer reaches 0
 * (if autoAdvance is true)
 */
export function useTaskTransition({
  activeTask,
  timeRemaining,
  isPaused,
  currentRun,
  onAdvanceTask,
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

    // Check if time has reached 0
    // Only trigger if we've been running for at least 1 second (prevents false triggers on task start)
    const hasBeenRunning = timeRemaining.elapsedMs >= 1000;

    // Check if we're transitioning from positive to zero/negative (crossing the zero threshold)
    const isTransitioningToZero = previousTime !== null && previousTime > 0 && timeRemaining.totalMs <= 0;

    // Only auto-advance when we're actually crossing from positive to zero/negative
    if (
      timeRemaining.totalMs <= 0 &&
      hasBeenRunning &&
      !hasAdvancedRef.current &&
      isTransitioningToZero &&
      activeTask.autoAdvance
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
  ]);
}
