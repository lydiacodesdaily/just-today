/**
 * focusStore.ts
 * Storage operations for Today and Later items
 */

import { FocusItem, FocusDuration, TimeBucket } from '../models/FocusItem';
import { getItem, setItem, KEYS } from './storage';
import { incrementTodayCounter, addFocusTime } from './snapshotStore';

/**
 * Load all focus items (Today + Later)
 */
export async function loadFocusItems(): Promise<FocusItem[]> {
  try {
    // Check if we need to do a daily rollover first
    await checkAndRolloverIfNewDay();

    const items = await getItem<FocusItem[]>(KEYS.FOCUS_ITEMS);
    return items || [];
  } catch (error) {
    console.error('Failed to load focus items:', error);
    return [];
  }
}

/**
 * Load only Today items
 */
export async function loadTodayFocusItems(): Promise<FocusItem[]> {
  const allItems = await loadFocusItems();
  return allItems.filter((item) => item.location === 'today' && !item.completedAt);
}

/**
 * Load only Later items
 */
export async function loadLaterItems(): Promise<FocusItem[]> {
  const allItems = await loadFocusItems();
  return allItems.filter((item) => item.location === 'later' && !item.completedAt);
}

/**
 * Save all focus items
 */
async function saveFocusItems(items: FocusItem[]): Promise<void> {
  try {
    await setItem(KEYS.FOCUS_ITEMS, items);
  } catch (error) {
    console.error('Failed to save focus items:', error);
  }
}

/**
 * Create a new focus item in Today
 */
export async function createTodayFocusItem(
  title: string,
  duration: FocusDuration
): Promise<FocusItem> {
  const items = await loadFocusItems();

  const newItem: FocusItem = {
    id: `focus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    estimatedDuration: duration,
    location: 'today',
    createdAt: new Date().toISOString(),
    addedToTodayAt: new Date().toISOString(),
  };

  items.push(newItem);
  await saveFocusItems(items);

  return newItem;
}

/**
 * Create a new focus item in Later
 */
export async function createLaterItem(
  title: string,
  duration: FocusDuration,
  reminderDate?: string
): Promise<FocusItem> {
  const items = await loadFocusItems();

  const newItem: FocusItem = {
    id: `focus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    estimatedDuration: duration,
    location: 'later',
    createdAt: new Date().toISOString(),
    movedToLaterAt: new Date().toISOString(),
    reminderDate,
  };

  items.push(newItem);
  await saveFocusItems(items);

  return newItem;
}

/**
 * Move an item from Today to Later
 */
export async function moveToLater(itemId: string, reminderDate?: string): Promise<void> {
  const items = await loadFocusItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  const wasInToday = items[itemIndex].location === 'today';

  items[itemIndex] = {
    ...items[itemIndex],
    location: 'later',
    movedToLaterAt: new Date().toISOString(),
    reminderDate,
  };

  await saveFocusItems(items);

  // Track movement to Later in daily snapshot (only if coming from Today)
  if (wasInToday) {
    await incrementTodayCounter('itemsMovedToLater');
  }
}

/**
 * Move an item from Later to Today
 */
export async function moveToToday(itemId: string): Promise<void> {
  const items = await loadFocusItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  items[itemIndex] = {
    ...items[itemIndex],
    location: 'today',
    addedToTodayAt: new Date().toISOString(),
  };

  await saveFocusItems(items);
}

/**
 * Mark a focus item as completed
 */
export async function markFocusItemComplete(itemId: string): Promise<void> {
  const items = await loadFocusItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  items[itemIndex] = {
    ...items[itemIndex],
    completedAt: new Date().toISOString(),
  };

  await saveFocusItems(items);

  // Track completion in daily snapshot
  await incrementTodayCounter('focusItemsCompleted');
}

/**
 * Delete a focus item permanently
 */
export async function deleteFocusItem(itemId: string): Promise<void> {
  const items = await loadFocusItems();
  const filteredItems = items.filter((item) => item.id !== itemId);
  await saveFocusItems(filteredItems);
}

/**
 * Update reminder date for a Later item
 */
export async function updateReminderDate(itemId: string, reminderDate?: string): Promise<void> {
  const items = await loadFocusItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  items[itemIndex] = {
    ...items[itemIndex],
    reminderDate,
  };

  await saveFocusItems(items);
}

/**
 * Update time bucket for a Later item
 */
export async function updateTimeBucket(itemId: string, timeBucket?: TimeBucket): Promise<void> {
  const items = await loadFocusItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  items[itemIndex] = {
    ...items[itemIndex],
    timeBucket,
  };

  await saveFocusItems(items);
}

/**
 * Start a focus session for an item
 */
export async function startFocusSession(itemId: string): Promise<void> {
  const items = await loadFocusItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  items[itemIndex] = {
    ...items[itemIndex],
    focusStartedAt: new Date().toISOString(),
  };

  await saveFocusItems(items);
}

/**
 * End a focus session for an item
 */
export async function endFocusSession(itemId: string): Promise<void> {
  const items = await loadFocusItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  const item = items[itemIndex];
  const endTime = new Date().toISOString();

  items[itemIndex] = {
    ...item,
    focusEndedAt: endTime,
  };

  await saveFocusItems(items);

  // Track focus time in daily snapshot if we have a start time
  if (item.focusStartedAt) {
    const startMs = new Date(item.focusStartedAt).getTime();
    const endMs = new Date(endTime).getTime();
    const durationMs = endMs - startMs;

    if (durationMs > 0) {
      await addFocusTime(durationMs);
    }
  }
}

/**
 * Check if it's a new day and rollover incomplete Today items to Later
 * This is the critical "nothing stays in Today overnight" rule
 */
export async function checkAndRolloverIfNewDay(): Promise<void> {
  try {
    const today = new Date().toDateString();
    const lastDate = await getItem<string>(KEYS.FOCUS_TODAY_DATE);

    // If it's a new day, rollover incomplete Today items to Later
    if (lastDate && lastDate !== today) {
      await rolloverIncompleteTodayItems();
    }

    // Update the stored date
    await setItem(KEYS.FOCUS_TODAY_DATE, today);
  } catch (error) {
    console.error('Failed to check and rollover:', error);
  }
}

/**
 * Move all incomplete Today items to Later
 * This happens automatically at midnight (or next app open)
 */
async function rolloverIncompleteTodayItems(): Promise<void> {
  try {
    const items = await getItem<FocusItem[]>(KEYS.FOCUS_ITEMS);
    if (!items) return;

    const now = new Date().toISOString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const updatedItems = items.map((item) => {
      // Only rollover items that are:
      // 1. In Today
      // 2. Not completed
      if (item.location === 'today' && !item.completedAt) {
        return {
          ...item,
          location: 'later' as const,
          movedToLaterAt: now,
          rolledOverFromDate: yesterdayStr,
          rolloverCount: (item.rolloverCount || 0) + 1,
        };
      }
      return item;
    });

    await saveFocusItems(updatedItems);
  } catch (error) {
    console.error('Failed to rollover items:', error);
  }
}

/**
 * Get count of items rolled over (for optional system message)
 */
export async function getRolloverCount(): Promise<number> {
  const items = await loadFocusItems();
  const today = new Date().toDateString();

  return items.filter(
    (item) =>
      item.location === 'later' &&
      !item.completedAt &&
      item.rolledOverFromDate === today
  ).length;
}

/**
 * Clear rollover tracking (after user has seen the message)
 */
export async function clearRolloverTracking(): Promise<void> {
  const items = await loadFocusItems();

  const updatedItems = items.map((item) => ({
    ...item,
    rolledOverFromDate: undefined,
  }));

  await saveFocusItems(updatedItems);
}

/**
 * Archive completed items older than 30 days
 */
export async function archiveOldCompletedItems(): Promise<void> {
  try {
    const items = await loadFocusItems();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeItems = items.filter((item) => {
      if (!item.completedAt) return true;
      const completedDate = new Date(item.completedAt);
      return completedDate > thirtyDaysAgo;
    });

    await saveFocusItems(activeItems);
  } catch (error) {
    console.error('Failed to archive old items:', error);
  }
}

/**
 * Reorder items within a location (today or later)
 * Updates the order property for all items in that location
 */
export async function reorderItems(
  reorderedItems: FocusItem[],
  location: 'today' | 'later'
): Promise<void> {
  try {
    const allItems = await loadFocusItems();

    // Create a map of reordered item IDs to their new order
    const orderMap = new Map<string, number>();
    reorderedItems.forEach((item, index) => {
      orderMap.set(item.id, index);
    });

    // Update order for items in the specified location
    const updatedItems = allItems.map((item) => {
      if (item.location === location && orderMap.has(item.id)) {
        return {
          ...item,
          order: orderMap.get(item.id),
        };
      }
      return item;
    });

    await saveFocusItems(updatedItems);
  } catch (error) {
    console.error('Failed to reorder items:', error);
  }
}

/**
 * Update specific fields on a focus item
 */
export async function updateFocusItem(
  itemId: string,
  updates: Partial<FocusItem>
): Promise<void> {
  try {
    const items = await loadFocusItems();
    const itemIndex = items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) return;

    items[itemIndex] = {
      ...items[itemIndex],
      ...updates,
    };

    await saveFocusItems(items);
  } catch (error) {
    console.error('Failed to update focus item:', error);
  }
}

/**
 * Set circle back date for an item
 */
export async function setCheckOnceDate(itemId: string, checkOnceDate: string): Promise<void> {
  await updateFocusItem(itemId, { checkOnceDate, checkOnceTriggeredAt: undefined });
}

/**
 * Clear circle back date for an item
 */
export async function clearCheckOnceDate(itemId: string): Promise<void> {
  await updateFocusItem(itemId, { checkOnceDate: undefined, checkOnceTriggeredAt: undefined });
}

/**
 * Mark circle back as triggered (prevents re-showing)
 */
export async function triggerCheckOnce(itemId: string): Promise<void> {
  await updateFocusItem(itemId, { checkOnceTriggeredAt: new Date().toISOString() });
}
