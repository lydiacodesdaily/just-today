/**
 * DailyEntry.ts
 * Data model for the daily first-entry check-in.
 * Appears once per day as a nervous-system reset entry point.
 * Distinct from CheckInItem (which is for periodic throughout-day captures).
 */

export type DailyEmotion =
  | 'anxious'
  | 'tired'
  | 'overwhelmed'
  | 'stuck'
  | 'good'
  | 'neutral';

export interface DailyEntry {
  id: string;
  text: string;            // May be empty string
  emotion?: DailyEmotion; // Optional chip selection
  createdAt: string;       // ISO timestamp
  dateKey: string;         // YYYY-MM-DD for daily grouping
}

/**
 * Get today's date key (YYYY-MM-DD)
 */
export function getTodayDateKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Create a new DailyEntry
 */
export function createDailyEntry(
  text: string,
  emotion?: DailyEmotion
): DailyEntry {
  const randomId = Math.random().toString(36).substr(2, 9);
  return {
    id: `daily-entry-${Date.now()}-${randomId}`,
    text,
    emotion,
    createdAt: new Date().toISOString(),
    dateKey: getTodayDateKey(),
  };
}

/**
 * Check if a DailyEntry is from today
 */
export function isFromToday(entry: DailyEntry): boolean {
  return entry.dateKey === getTodayDateKey();
}
