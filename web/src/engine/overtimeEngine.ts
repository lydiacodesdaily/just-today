/**
 * overtimeEngine.ts
 * Manages overtime reminder logic (every 5 minutes: 5, 10, 15, ...).
 */

import { RunTask } from '../models/RoutineRun';
import { TimeRemaining } from './timerEngine';

/**
 * Determines if an overtime reminder should be triggered.
 * Returns the minute interval (5, 10, 15, ...) if a reminder is due,
 * or null if no reminder should fire.
 *
 * This function checks if we've crossed a 5-minute boundary and haven't
 * already announced it.
 */
export function checkOvertimeReminder(
  task: RunTask,
  timeRemaining: TimeRemaining
): number | null {
  if (!timeRemaining.isOvertime) {
    return null;
  }

  const overtimeMinutes = Math.floor(timeRemaining.overtimeMs / (60 * 1000));

  // Check if we've hit a 5-minute boundary
  if (overtimeMinutes > 0 && overtimeMinutes % 5 === 0) {
    // Have we already announced this interval?
    if (!task.overtimeAnnouncedMinutes.includes(overtimeMinutes)) {
      return overtimeMinutes;
    }
  }

  return null;
}

/**
 * Marks an overtime interval as announced.
 */
export function markOvertimeAnnounced(
  task: RunTask,
  minutes: number
): RunTask {
  return {
    ...task,
    overtimeAnnouncedMinutes: [...task.overtimeAnnouncedMinutes, minutes],
  };
}

/**
 * Generates the overtime reminder message.
 */
export function getOvertimeMessage(taskName: string, minutes: number): string {
  return `${taskName} is ${minutes} minutes over time`;
}
