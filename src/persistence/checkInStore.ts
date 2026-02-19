/**
 * checkInStore.ts
 * Storage operations for Check-in items - one-line captures throughout the day
 */

import { Pace } from '../models/RoutineTemplate';
import {
  CheckInItem,
  createCheckInItem,
  getTodayDateKey,
  isFromToday,
} from '../models/CheckInItem';
import { getItem, setItem, KEYS } from './storage';

/**
 * Load all check-in items
 */
export async function loadCheckInItems(): Promise<CheckInItem[]> {
  try {
    const items = await getItem<CheckInItem[]>(KEYS.CHECKIN_ITEMS);
    return items || [];
  } catch (error) {
    console.error('Failed to load check-in items:', error);
    return [];
  }
}

/**
 * Load only today's items
 */
export async function loadTodayCheckInItems(): Promise<CheckInItem[]> {
  const allItems = await loadCheckInItems();
  return allItems.filter(isFromToday);
}

/**
 * Load previous days' items (for reflection view)
 */
export async function loadPreviousCheckInItems(): Promise<CheckInItem[]> {
  const allItems = await loadCheckInItems();
  return allItems.filter((item) => !isFromToday(item));
}

/**
 * Save all check-in items
 */
async function saveCheckInItems(items: CheckInItem[]): Promise<void> {
  try {
    await setItem(KEYS.CHECKIN_ITEMS, items);
  } catch (error) {
    console.error('Failed to save check-in items:', error);
  }
}

/**
 * Add a new check-in item
 */
export async function addCheckInItem(
  text: string,
  mood?: Pace
): Promise<CheckInItem> {
  const items = await loadCheckInItems();
  const newItem = createCheckInItem(text, mood);

  items.push(newItem);
  await saveCheckInItems(items);

  return newItem;
}

/**
 * Update a check-in item's text
 */
export async function updateCheckInItem(
  itemId: string,
  newText: string
): Promise<void> {
  const items = await loadCheckInItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  items[itemIndex] = {
    ...items[itemIndex],
    text: newText,
  };

  await saveCheckInItems(items);
}

/**
 * Update a check-in item's mood
 */
export async function updateCheckInItemMood(
  itemId: string,
  mood: Pace | undefined
): Promise<void> {
  const items = await loadCheckInItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  items[itemIndex] = {
    ...items[itemIndex],
    mood,
  };

  await saveCheckInItems(items);
}

/**
 * Delete a check-in item
 */
export async function deleteCheckInItem(itemId: string): Promise<void> {
  const items = await loadCheckInItems();
  const filteredItems = items.filter((item) => item.id !== itemId);
  await saveCheckInItems(filteredItems);
}

/**
 * Cleanup old items (older than 30 days)
 */
export async function cleanupOldCheckInItems(): Promise<void> {
  try {
    const items = await loadCheckInItems();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffKey = thirtyDaysAgo.toISOString().split('T')[0];

    const recentItems = items.filter((item) => item.dateKey >= cutoffKey);
    await saveCheckInItems(recentItems);
  } catch (error) {
    console.error('Failed to cleanup old check-in items:', error);
  }
}

/**
 * Get items grouped by date (for reflection view)
 */
export async function getCheckInItemsByDate(): Promise<
  Record<string, CheckInItem[]>
> {
  const items = await loadCheckInItems();
  const grouped: Record<string, CheckInItem[]> = {};

  items.forEach((item) => {
    if (!grouped[item.dateKey]) {
      grouped[item.dateKey] = [];
    }
    grouped[item.dateKey].push(item);
  });

  return grouped;
}
