/**
 * brainDumpStore.ts
 * Storage operations for Brain Dump items
 */

import { BrainDumpItem, createBrainDumpItem, isItemExpired } from '../models/BrainDumpItem';
import { getItem, setItem, KEYS } from './storage';

/**
 * Load all brain dump items (automatically cleans expired items)
 */
export async function loadBrainDumpItems(): Promise<BrainDumpItem[]> {
  try {
    await cleanupExpiredItems();

    const items = await getItem<BrainDumpItem[]>(KEYS.BRAIN_DUMP_ITEMS);
    return items || [];
  } catch (error) {
    console.error('Failed to load brain dump items:', error);
    return [];
  }
}

/**
 * Load only unsorted items
 */
export async function loadUnsortedItems(): Promise<BrainDumpItem[]> {
  const allItems = await loadBrainDumpItems();
  return allItems.filter((item) => item.status === 'unsorted');
}

/**
 * Save all brain dump items
 */
async function saveBrainDumpItems(items: BrainDumpItem[]): Promise<void> {
  try {
    await setItem(KEYS.BRAIN_DUMP_ITEMS, items);
  } catch (error) {
    console.error('Failed to save brain dump items:', error);
  }
}

/**
 * Add a new brain dump item
 */
export async function addBrainDumpItem(text: string): Promise<BrainDumpItem> {
  const items = await loadBrainDumpItems();
  const newItem = createBrainDumpItem(text);

  items.push(newItem);
  await saveBrainDumpItems(items);

  return newItem;
}

/**
 * Mark an item as kept (moves it to Later)
 */
export async function keepBrainDumpItem(itemId: string): Promise<void> {
  const items = await loadBrainDumpItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  items[itemIndex] = {
    ...items[itemIndex],
    status: 'kept',
    keptAt: new Date().toISOString(),
  };

  await saveBrainDumpItems(items);
}

/**
 * Delete a brain dump item permanently
 */
export async function deleteBrainDumpItem(itemId: string): Promise<void> {
  const items = await loadBrainDumpItems();
  const filteredItems = items.filter((item) => item.id !== itemId);
  await saveBrainDumpItems(filteredItems);
}

/**
 * Cleanup items that are older than 24 hours (if not kept)
 */
export async function cleanupExpiredItems(): Promise<void> {
  try {
    const items = await getItem<BrainDumpItem[]>(KEYS.BRAIN_DUMP_ITEMS);
    if (!items) return;

    const activeItems = items.filter((item) => !isItemExpired(item));

    await saveBrainDumpItems(activeItems);
  } catch (error) {
    console.error('Failed to cleanup expired items:', error);
  }
}

/**
 * Get a specific brain dump item by ID
 */
export async function getBrainDumpItem(itemId: string): Promise<BrainDumpItem | null> {
  const items = await loadBrainDumpItems();
  return items.find((item) => item.id === itemId) || null;
}

/**
 * Update a brain dump item's text
 */
export async function updateBrainDumpItem(itemId: string, newText: string): Promise<void> {
  const items = await loadBrainDumpItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  items[itemIndex] = {
    ...items[itemIndex],
    text: newText,
  };

  await saveBrainDumpItems(items);
}
