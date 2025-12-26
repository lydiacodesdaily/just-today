/**
 * useTimer.ts
 * Hook for managing timer updates with drift correction.
 */

import { useEffect, useState } from 'react';
import { RunTask } from '../models/RoutineRun';
import { computeRemainingTime, TimeRemaining } from '../engine/timerEngine';

/**
 * Updates every second with current time remaining for a task.
 * Uses timestamp-based calculation to avoid drift.
 */
export function useTimer(
  task: RunTask | null,
  isPaused: boolean = false,
  pausedAt?: number | null
): TimeRemaining | null {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
    null
  );

  useEffect(() => {
    if (!task || task.status !== 'active') {
      setTimeRemaining(null);
      return;
    }

    // Initial calculation
    setTimeRemaining(computeRemainingTime(task, isPaused, pausedAt));

    if (isPaused) {
      // Don't update while paused
      return;
    }

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(computeRemainingTime(task, isPaused, pausedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [task, isPaused, pausedAt]);

  return timeRemaining;
}
