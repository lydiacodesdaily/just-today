/**
 * pacePicksStore.ts
 * Persistence layer for Extras items.
 */

import { getItem, setItem, KEYS } from './storage';
import { PacePick, PaceTag } from '../models/PacePick';

/**
 * Load all Extras items from storage
 */
export async function loadPacePicks(): Promise<PacePick[]> {
  const items = await getItem<PacePick[]>(KEYS.PACE_PICKS);
  return items ?? [];
}

/**
 * Save all Extras items to storage
 */
export async function savePacePicks(items: PacePick[]): Promise<void> {
  await setItem(KEYS.PACE_PICKS, items);
}

/**
 * Create a new Extra item
 */
export async function createPacePick(item: Omit<PacePick, 'id' | 'createdAt' | 'updatedAt'>): Promise<PacePick> {
  const items = await loadPacePicks();
  const now = Date.now();
  const newItem: PacePick = {
    ...item,
    id: `pace-pick-${now}`,
    createdAt: now,
    updatedAt: now,
  };
  items.push(newItem);
  await savePacePicks(items);
  return newItem;
}

/**
 * Update an existing Extra item
 */
export async function updatePacePick(
  id: string,
  updates: Partial<Omit<PacePick, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const items = await loadPacePicks();
  const index = items.findIndex(item => item.id === id);
  if (index === -1) {
    throw new Error(`Extra item ${id} not found`);
  }
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: Date.now(),
  };
  await savePacePicks(items);
}

/**
 * Delete an Extra item
 */
export async function deletePacePick(id: string): Promise<void> {
  const items = await loadPacePicks();
  const filtered = items.filter(item => item.id !== id);
  await savePacePicks(filtered);
}

/**
 * Get Extra items by pace
 */
export async function getPacePicksByPace(pace: PaceTag): Promise<PacePick[]> {
  const items = await loadPacePicks();
  return items.filter(item => item.paceTag === pace);
}
