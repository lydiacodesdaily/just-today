/**
 * useCheckOnce.ts
 * Hook for managing check once resurfacing logic
 */

import { FocusItem, isCheckOnceDue } from '@/src/models/FocusItem';

export interface CheckOnceGroups {
  scheduled: FocusItem[]; // Items with future check dates
  due: FocusItem[]; // Items ready to check today or past due
  none: FocusItem[]; // Items without check once dates
}

/**
 * Groups Later items by check once status
 */
export function useCheckOnce(laterItems: FocusItem[]): CheckOnceGroups {
  const scheduled: FocusItem[] = [];
  const due: FocusItem[] = [];
  const none: FocusItem[] = [];

  laterItems.forEach((item) => {
    if (!item.checkOnceDate) {
      none.push(item);
    } else if (isCheckOnceDue(item)) {
      due.push(item);
    } else {
      scheduled.push(item);
    }
  });

  return { scheduled, due, none };
}

/**
 * Get today's date string in YYYY-MM-DD format (local timezone)
 */
export function getTodayDateString(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split('T')[0];
}
