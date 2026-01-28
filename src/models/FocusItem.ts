/**
 * FocusItem.ts
 * Data models for Today and Later items
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
 * Time bucket options for Later items
 * These are optional, manual labels to help users mentally offload
 * when to think about an item again - no automation or urgency
 */
export type TimeBucket =
  | 'NONE'
  | 'TOMORROW'
  | 'THIS_WEEKEND'
  | 'NEXT_WEEK'
  | 'LATER_THIS_MONTH'
  | 'SOMEDAY';

/**
 * Subtask within a FocusItem
 */
export interface Subtask {
  id: string;
  text: string;
  order: number;
  completed: boolean;
  estimatedDurationMs?: number;
  completedAt?: string; // ISO date string
}

/**
 * FocusItem - Represents an item in either Today or Later
 */
export interface FocusItem {
  id: string;
  title: string;
  estimatedDuration: FocusDuration;

  // Location tracking
  location: 'today' | 'later' | 'archived';

  // Timestamps
  createdAt: string; // ISO date string
  addedToTodayAt?: string; // When moved to Today
  movedToLaterAt?: string; // When moved to Later
  completedAt?: string; // When marked complete
  archivedAt?: string; // When archived

  // Later-specific fields
  reminderDate?: string; // ISO date string for when to remind
  reminderTiming?: ReminderTiming; // How the reminder was set
  timeBucket?: TimeBucket; // Optional manual time bucket label (defaults to NONE)
  lastReviewPromptDate?: string; // Last time user was prompted to review this item

  // Focus session tracking
  focusStartedAt?: string;
  focusEndedAt?: string;

  // Rollover tracking
  rolledOverFromDate?: string; // Original date if item was rolled over
  rolloverCount?: number; // How many times this item has rolled over

  // Subtasks
  subtasks?: Subtask[];
  subtaskSuggestionDismissed?: boolean; // User dismissed subtask suggestion for this item

  // Ordering within section
  order?: number; // Position within the section (lower = higher priority)

  // Circle Back resurfacing (calm, single-time resurfacing)
  checkOnceDate?: string; // ISO date string (YYYY-MM-DD) for when to resurface once
  checkOnceTriggeredAt?: string; // ISO timestamp when item became due (ensures one-time resurfacing)
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

/**
 * Helper function to format time bucket for display
 */
export function formatTimeBucket(bucket?: TimeBucket): string {
  if (!bucket || bucket === 'NONE') return '';

  const mapping: Record<TimeBucket, string> = {
    NONE: '',
    TOMORROW: 'Tomorrow',
    THIS_WEEKEND: 'This Weekend',
    NEXT_WEEK: 'Next Week',
    LATER_THIS_MONTH: 'Later This Month',
    SOMEDAY: 'Someday',
  };

  return mapping[bucket] || '';
}

/**
 * Circle Back preset types
 */
export type CheckOncePreset = 'few-days' | 'next-week' | 'two-weeks' | 'custom';

/**
 * Helper function to calculate circle back date from preset
 */
export function calculateCheckOnceDate(preset: CheckOncePreset, customDate?: Date): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'few-days':
      const fewDays = new Date(today);
      fewDays.setDate(fewDays.getDate() + 3);
      return fewDays.toISOString().split('T')[0];

    case 'next-week':
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];

    case 'two-weeks':
      const twoWeeks = new Date(today);
      twoWeeks.setDate(twoWeeks.getDate() + 14);
      return twoWeeks.toISOString().split('T')[0];

    case 'custom':
      if (!customDate) return null;
      const custom = new Date(customDate);
      custom.setHours(0, 0, 0, 0);
      return custom.toISOString().split('T')[0];

    default:
      return null;
  }
}

/**
 * Helper function to check if circle back date is due (using local date comparison)
 */
export function isCheckOnceDue(item: FocusItem): boolean {
  if (!item.checkOnceDate || item.checkOnceTriggeredAt) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

  return todayString >= item.checkOnceDate;
}

/**
 * Helper function to format circle back date for display
 */
export function formatCheckOnceDate(checkOnceDate?: string): string {
  if (!checkOnceDate) return '';

  const date = new Date(checkOnceDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayString = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];

  if (checkOnceDate === todayString) {
    return 'Check today';
  }

  if (checkOnceDate === tomorrowString) {
    return 'Check tomorrow';
  }

  if (checkOnceDate < todayString) {
    return 'Ready to check';
  }

  // Future date
  return `Check on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}
