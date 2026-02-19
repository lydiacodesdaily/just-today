/**
 * checkInGrouping.ts
 * Utilities for grouping Check-in items by time blocks
 */

import { CheckInItem, TimeBlock } from '../models/CheckInItem';

export interface GroupedCheckInItems {
  timeBlock: TimeBlock;
  label: string;
  items: CheckInItem[];
}

const TIME_BLOCK_LABELS: Record<TimeBlock, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

const TIME_BLOCK_ORDER: TimeBlock[] = ['morning', 'afternoon', 'evening'];

/**
 * Group items by time block (morning, afternoon, evening)
 * Returns only groups that have items
 */
export function groupByTimeBlock(items: CheckInItem[]): GroupedCheckInItems[] {
  const groups: Record<TimeBlock, CheckInItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  items.forEach((item) => {
    groups[item.timeBlock].push(item);
  });

  // Return only non-empty groups in order
  return TIME_BLOCK_ORDER.filter((block) => groups[block].length > 0).map(
    (block) => ({
      timeBlock: block,
      label: TIME_BLOCK_LABELS[block],
      items: groups[block],
    })
  );
}

/**
 * Format a date key (YYYY-MM-DD) for display
 */
export function formatDateKey(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) {
    return 'Today';
  }

  if (date.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Format as "Mon, Jan 15"
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Group items by date for reflection view
 */
export function groupByDate(
  items: CheckInItem[]
): { dateKey: string; label: string; items: CheckInItem[] }[] {
  const grouped: Record<string, CheckInItem[]> = {};

  items.forEach((item) => {
    if (!grouped[item.dateKey]) {
      grouped[item.dateKey] = [];
    }
    grouped[item.dateKey].push(item);
  });

  // Sort by date descending (most recent first)
  return Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .map((dateKey) => ({
      dateKey,
      label: formatDateKey(dateKey),
      items: grouped[dateKey],
    }));
}
