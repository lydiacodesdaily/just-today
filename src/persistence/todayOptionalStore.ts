/**
 * todayOptionalStore.ts
 * Persistence layer for Today Optional Items.
 * These items expire daily and are automatically cleared at midnight.
 */

import { getItem, setItem, KEYS } from './storage';
import { TodayOptionalItem, PacePick } from '../models/PacePick';

/**
 * Get today's date string (YYYY-MM-DD) for comparison
 */
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Check if Today Optional Items need to be reset (new day)
 * Returns true if reset occurred
 */
export async function checkAndResetIfNewDay(): Promise<boolean> {
  const storedDate = await getItem<string>(KEYS.TODAY_DATE);
  const currentDate = getTodayDateString();

  if (storedDate !== currentDate) {
    // New day - clear optional items
    await setItem(KEYS.TODAY_OPTIONAL_ITEMS, []);
    await setItem(KEYS.TODAY_DATE, currentDate);
    return true;
  }

  return false;
}

/**
 * Load Today Optional Items (automatically resets if new day)
 */
export async function loadTodayOptionalItems(): Promise<TodayOptionalItem[]> {
  await checkAndResetIfNewDay();
  const items = await getItem<TodayOptionalItem[]>(KEYS.TODAY_OPTIONAL_ITEMS);
  return items ?? [];
}

/**
 * Save Today Optional Items to storage
 */
async function saveTodayOptionalItems(items: TodayOptionalItem[]): Promise<void> {
  await setItem(KEYS.TODAY_OPTIONAL_ITEMS, items);
}

/**
 * Add an Extra to Today as an Optional item
 */
export async function addOptionalItemToToday(menuItem: PacePick): Promise<TodayOptionalItem> {
  const items = await loadTodayOptionalItems();

  const newItem: TodayOptionalItem = {
    id: `optional-${Date.now()}`,
    menuItemId: menuItem.id,
    title: menuItem.title,
    estimatedDuration: menuItem.estimatedDuration,
    addedAt: Date.now(),
  };

  items.push(newItem);
  await saveTodayOptionalItems(items);
  return newItem;
}

/**
 * Remove an Optional item from Today
 */
export async function removeOptionalItem(id: string): Promise<void> {
  const items = await loadTodayOptionalItems();
  const filtered = items.filter(item => item.id !== id);
  await saveTodayOptionalItems(filtered);
}

/**
 * Mark an Optional item as completed
 */
export async function markOptionalComplete(id: string): Promise<void> {
  const items = await loadTodayOptionalItems();
  const index = items.findIndex(item => item.id === id);

  if (index === -1) {
    throw new Error(`Optional item ${id} not found`);
  }

  items[index] = {
    ...items[index],
    completedAt: Date.now(),
  };

  await saveTodayOptionalItems(items);
}

/**
 * Start focus session for an Optional item
 */
export async function startOptionalFocus(id: string): Promise<void> {
  const items = await loadTodayOptionalItems();
  const index = items.findIndex(item => item.id === id);

  if (index === -1) {
    throw new Error(`Optional item ${id} not found`);
  }

  items[index] = {
    ...items[index],
    focusStartedAt: Date.now(),
  };

  await saveTodayOptionalItems(items);
}

/**
 * End focus session for an Optional item
 */
export async function endOptionalFocus(id: string): Promise<void> {
  const items = await loadTodayOptionalItems();
  const index = items.findIndex(item => item.id === id);

  if (index === -1) {
    throw new Error(`Optional item ${id} not found`);
  }

  items[index] = {
    ...items[index],
    focusEndedAt: Date.now(),
  };

  await saveTodayOptionalItems(items);
}

/**
 * Manually clear all Today Optional Items
 */
export async function clearTodayOptionalItems(): Promise<void> {
  await setItem(KEYS.TODAY_OPTIONAL_ITEMS, []);
}
