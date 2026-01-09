/**
 * DailySnapshot.ts
 * Data model for daily reflection snapshots
 */

export type EnergyMode = 'low' | 'steady' | 'flow';

/**
 * DailySnapshot - Captures the essence of a day's activity
 * Used for gentle, affirming reflections without judgment
 */
export interface DailySnapshot {
  /** Date in YYYY-MM-DD format */
  date: string;

  /** Number of focus items completed */
  focusItemsCompleted: number;

  /** Number of routine runs completed */
  routineRunsCompleted: number;

  /** Number of tasks completed across all routines (including partial) */
  tasksCompletedInRoutines: number;

  /** Total time spent in focus sessions (milliseconds) */
  totalFocusTimeMs: number;

  /** Energy modes selected throughout the day */
  energyModesSelected: EnergyMode[];

  /** Number of items moved to Later (not judgmental, just informational) */
  itemsMovedToLater: number;

  /** Timestamp of first activity of the day (optional) */
  firstActivityAt?: string;

  /** Timestamp of last activity of the day (optional) */
  lastActivityAt?: string;
}

/**
 * Helper function to create an empty snapshot for a given date
 */
export function createEmptySnapshot(date: string): DailySnapshot {
  return {
    date,
    focusItemsCompleted: 0,
    routineRunsCompleted: 0,
    tasksCompletedInRoutines: 0,
    totalFocusTimeMs: 0,
    energyModesSelected: [],
    itemsMovedToLater: 0,
  };
}

/**
 * Helper function to format date as YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Helper function to parse YYYY-MM-DD date string to Date
 */
export function parseDateKey(dateKey: string): Date {
  return new Date(dateKey + 'T00:00:00.000Z');
}

/**
 * Helper function to get date range for the week containing a date
 */
export function getWeekDates(date: Date): Date[] {
  const week: Date[] = [];
  const current = new Date(date);

  // Get to start of week (Sunday)
  const dayOfWeek = current.getDay();
  current.setDate(current.getDate() - dayOfWeek);

  // Generate 7 days
  for (let i = 0; i < 7; i++) {
    week.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return week;
}

/**
 * Helper function to format total focus time for display
 */
export function formatFocusTime(ms: number): string {
  const totalMinutes = Math.floor(ms / (1000 * 60));

  if (totalMinutes < 1) {
    return 'less than a minute';
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  return `${hours}h ${minutes}m`;
}
