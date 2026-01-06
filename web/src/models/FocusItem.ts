/**
 * FocusItem.ts
 * Data models for Today's Focus and Later items
 */

/**
 * Duration options for focus items
 */
export type FocusDuration =
  | '~5 min'
  | '~10 min'
  | '~15 min'
  | '~25 min'
  | '~30 min'
  | '~45 min'
  | '~1 hour'
  | '~2 hours';

/**
 * Reminder timing options for Later items
 */
export type ReminderTiming =
  | 'tomorrow'
  | 'in-a-few-days'
  | 'custom';

/**
 * FocusItem - Represents an item in either Today's Focus or Later
 */
export interface FocusItem {
  id: string;
  title: string;
  estimatedDuration: FocusDuration;

  // Location tracking
  location: 'today' | 'later';

  // Timestamps
  createdAt: string; // ISO date string
  addedToTodayAt?: string; // When moved to Today
  movedToLaterAt?: string; // When moved to Later
  completedAt?: string; // When marked complete

  // Later-specific fields
  reminderDate?: string; // ISO date string for when to remind
  reminderTiming?: ReminderTiming; // How the reminder was set

  // Focus session tracking
  focusStartedAt?: string;
  focusEndedAt?: string;

  // Rollover tracking
  rolledOverFromDate?: string; // Original date if item was rolled over
  rolloverCount?: number; // How many times this item has rolled over
}

/**
 * Helper function to convert FocusDuration to milliseconds
 */
export function durationToMs(duration: FocusDuration): number {
  const mapping: Record<FocusDuration, number> = {
    '~5 min': 5 * 60 * 1000,
    '~10 min': 10 * 60 * 1000,
    '~15 min': 15 * 60 * 1000,
    '~25 min': 25 * 60 * 1000,
    '~30 min': 30 * 60 * 1000,
    '~45 min': 45 * 60 * 1000,
    '~1 hour': 60 * 60 * 1000,
    '~2 hours': 120 * 60 * 1000,
  };
  return mapping[duration] || 15 * 60 * 1000; // Default to 15 minutes
}

/**
 * Helper function to calculate reminder date from timing option
 */
export function calculateReminderDate(timing: ReminderTiming, customDate?: Date): Date | null {
  const now = new Date();

  switch (timing) {
    case 'tomorrow':
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
      return tomorrow;

    case 'in-a-few-days':
      const fewDays = new Date(now);
      fewDays.setDate(fewDays.getDate() + 3);
      fewDays.setHours(9, 0, 0, 0); // 9 AM in 3 days
      return fewDays;

    case 'custom':
      return customDate || null;

    default:
      return null;
  }
}

/**
 * Helper function to check if a reminder date has passed
 */
export function isReminderDue(reminderDate?: string): boolean {
  if (!reminderDate) return false;
  const now = new Date();
  const reminder = new Date(reminderDate);
  return now >= reminder;
}

/**
 * Helper function to format reminder date for display
 */
export function formatReminderDate(reminderDate?: string): string {
  if (!reminderDate) return '';

  const date = new Date(reminderDate);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if it's today
  if (date.toDateString() === now.toDateString()) {
    return 'Today';
  }

  // Check if it's tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  // Check if it's within this week
  const daysUntil = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil >= 0 && daysUntil <= 7) {
    return `In ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
  }

  // Otherwise, show the date
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
