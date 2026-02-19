/**
 * checkInGrouping.ts
 * Utility functions for grouping and formatting check-in items
 */

import { CheckInItem, TimeBlock } from '@/src/models/CheckInItem';

export interface TimeBlockGroup {
  timeBlock: TimeBlock;
  label: string;
  items: CheckInItem[];
}

const TIME_BLOCK_ORDER: TimeBlock[] = ['morning', 'afternoon', 'evening'];
const TIME_BLOCK_LABELS: Record<TimeBlock, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

/**
 * Group items by time block (morning/afternoon/evening), returns only non-empty groups
 * in chronological order.
 */
export function groupByTimeBlock(items: CheckInItem[]): TimeBlockGroup[] {
  const groups: Record<TimeBlock, CheckInItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  for (const item of items) {
    groups[item.timeBlock].push(item);
  }

  return TIME_BLOCK_ORDER.filter((block) => groups[block].length > 0).map((block) => ({
    timeBlock: block,
    label: TIME_BLOCK_LABELS[block],
    items: groups[block],
  }));
}

/**
 * Format a date key (YYYY-MM-DD) to a human-readable label.
 */
export function formatDateKey(dateKey: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';

  const date = new Date(dateKey + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Group items by date key, sorted descending (most recent first).
 */
export function groupByDate(items: CheckInItem[]): { dateKey: string; label: string; items: CheckInItem[] }[] {
  const map = new Map<string, CheckInItem[]>();

  for (const item of items) {
    const existing = map.get(item.dateKey) ?? [];
    map.set(item.dateKey, [...existing, item]);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, dateItems]) => ({
      dateKey,
      label: formatDateKey(dateKey),
      items: dateItems,
    }));
}
