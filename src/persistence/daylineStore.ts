/**
 * daylineStore.ts
 * Storage operations for Dayline items - one-line memory captures
 */

import { Pace } from '../models/RoutineTemplate';
import {
  DaylineItem,
  createDaylineItem,
  getTodayDateKey,
  isFromToday,
} from '../models/DaylineItem';
import { getItem, setItem, KEYS } from './storage';

/**
 * Load all dayline items
 */
export async function loadDaylineItems(): Promise<DaylineItem[]> {
  try {
    const items = await getItem<DaylineItem[]>(KEYS.DAYLINE_ITEMS);
    return items || [];
  } catch (error) {
    console.error('Failed to load dayline items:', error);
    return [];
  }
}

/**
 * Load only today's items
 */
export async function loadTodayDaylineItems(): Promise<DaylineItem[]> {
  const allItems = await loadDaylineItems();
  return allItems.filter(isFromToday);
}

/**
 * Load previous days' items (for reflection view)
 */
export async function loadPreviousDaylineItems(): Promise<DaylineItem[]> {
  const allItems = await loadDaylineItems();
  return allItems.filter((item) => !isFromToday(item));
}

/**
 * Save all dayline items
 */
async function saveDaylineItems(items: DaylineItem[]): Promise<void> {
  try {
    await setItem(KEYS.DAYLINE_ITEMS, items);
  } catch (error) {
    console.error('Failed to save dayline items:', error);
  }
}

/**
 * Add a new dayline item
 */
export async function addDaylineItem(
  text: string,
  mood?: Pace
): Promise<DaylineItem> {
  const items = await loadDaylineItems();
  const newItem = createDaylineItem(text, mood);

  items.push(newItem);
  await saveDaylineItems(items);

  return newItem;
}

/**
 * Update a dayline item's text
 */
export async function updateDaylineItem(
  itemId: string,
  newText: string
): Promise<void> {
  const items = await loadDaylineItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  items[itemIndex] = {
    ...items[itemIndex],
    text: newText,
  };

  await saveDaylineItems(items);
}

/**
 * Update a dayline item's mood
 */
export async function updateDaylineItemMood(
  itemId: string,
  mood: Pace | undefined
): Promise<void> {
  const items = await loadDaylineItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  items[itemIndex] = {
    ...items[itemIndex],
    mood,
  };

  await saveDaylineItems(items);
}

/**
 * Delete a dayline item
 */
export async function deleteDaylineItem(itemId: string): Promise<void> {
  const items = await loadDaylineItems();
  const filteredItems = items.filter((item) => item.id !== itemId);
  await saveDaylineItems(filteredItems);
}

/**
 * Cleanup old items (older than 30 days)
 */
export async function cleanupOldDaylineItems(): Promise<void> {
  try {
    const items = await loadDaylineItems();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffKey = thirtyDaysAgo.toISOString().split('T')[0];

    const recentItems = items.filter((item) => item.dateKey >= cutoffKey);
    await saveDaylineItems(recentItems);
  } catch (error) {
    console.error('Failed to cleanup old dayline items:', error);
  }
}

/**
 * Get items grouped by date (for reflection view)
 */
export async function getDaylineItemsByDate(): Promise<
  Record<string, DaylineItem[]>
> {
  const items = await loadDaylineItems();
  const grouped: Record<string, DaylineItem[]> = {};

  items.forEach((item) => {
    if (!grouped[item.dateKey]) {
      grouped[item.dateKey] = [];
    }
    grouped[item.dateKey].push(item);
  });

  return grouped;
}