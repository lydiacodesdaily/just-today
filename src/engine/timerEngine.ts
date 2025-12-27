/**
 * timerEngine.ts
 * Timer logic with drift prevention using timestamps.
 */

import { RoutineRun, RunTask } from '../models/RoutineRun';

export interface TimeRemaining {
  /** Milliseconds remaining (negative if overtime) */
  remainingMs: number;
  /** True if task is in overtime */
  isOvertime: boolean;
  /** Milliseconds into overtime (0 if not overtime) */
  overtimeMs: number;
  /** Total elapsed time for this task */
  elapsedMs: number;
  /** Total planned duration (including extensions) */
  totalPlannedMs: number;
  /** Total time (same as remainingMs for convenience) */
  totalMs: number;
}

/**
 * Computes the remaining time for an active task.
 * Uses timestamps to avoid drift.
 */
export function computeRemainingTime(
  task: RunTask,
  isPaused: boolean = false,
  pausedAt?: number | null
): TimeRemaining | null {
  if (!task.startedAt || !task.plannedEndAt) {
    return null;
  }

  const now = isPaused && pausedAt ? pausedAt : Date.now();
  const elapsedMs = now - task.startedAt;
  const totalPlannedMs = task.durationMs + task.extensionMs;
  const remainingMs = task.plannedEndAt - now;

  const isOvertime = remainingMs < 0;
  const overtimeMs = isOvertime ? Math.abs(remainingMs) : 0;

  return {
    remainingMs,
    isOvertime,
    overtimeMs,
    elapsedMs,
    totalPlannedMs,
    totalMs: remainingMs,
  };
}

/**
 * Formats milliseconds into MM:SS format.
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formats time remaining for display.
 * Returns "+MM:SS" for overtime.
 */
export function formatTimeRemaining(timeRemaining: TimeRemaining): string {
  if (timeRemaining.isOvertime) {
    return `+${formatTime(timeRemaining.overtimeMs)}`;
  }
  return formatTime(timeRemaining.remainingMs);
}
