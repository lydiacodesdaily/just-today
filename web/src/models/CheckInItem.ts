/**
 * CheckInItem.ts
 * Data model for Check-ins - one-line captures of how the day is going
 */

import { Pace } from './RoutineTemplate';

export type TimeBlock = 'morning' | 'afternoon' | 'evening';

export interface CheckInItem {
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
 * Create a new Check-in item
 */
export function createCheckInItem(text: string, mood?: Pace): CheckInItem {
  const now = new Date();
  const randomId = Math.random().toString(36).substr(2, 9);

  return {
    id: `checkin-${Date.now()}-${randomId}`,
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
export function isFromToday(item: CheckInItem): boolean {
  return item.dateKey === getTodayDateKey();
}
