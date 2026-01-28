/**
 * DaylineItem.ts
 * Data model for Dayline - one-line memory captures throughout the day
 */

import { Pace } from './RoutineTemplate';

export type TimeBlock = 'morning' | 'afternoon' | 'evening';

export interface DaylineItem {
  id: string;
  text: string;
  createdAt: string; // ISO date string
  timeBlock: TimeBlock; // morning, afternoon, evening
  mood?: Pace; // Optional mood/energy dot (low, steady, flow)
  dateKey: string; // YYYY-MM-DD for grouping by day
}

/**
 * Get the time block based on the hour
 */
function getTimeBlock(date: Date): TimeBlock {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Get today's date key (YYYY-MM-DD)
 */
export function getTodayDateKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Create a new Dayline item
 */
export function createDaylineItem(text: string, mood?: Pace): DaylineItem {
  const now = new Date();
  const randomId = Math.random().toString(36).substr(2, 9);

  return {
    id: `dayline-${Date.now()}-${randomId}`,
    text,
    createdAt: now.toISOString(),
    timeBlock: getTimeBlock(now),
    mood,
    dateKey: getTodayDateKey(),
  };
}

/**
 * Check if an item is from today
 */
export function isFromToday(item: DaylineItem): boolean {
  return item.dateKey === getTodayDateKey();
}
