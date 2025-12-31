/**
 * energyMenuStore.ts
 * Persistence layer for Energy Menu items.
 */

import { getItem, setItem, KEYS } from './storage';
import { EnergyMenuItem } from '../models/EnergyMenuItem';

/**
 * Load all Energy Menu items from storage
 */
export async function loadEnergyMenuItems(): Promise<EnergyMenuItem[]> {
  const items = await getItem<EnergyMenuItem[]>(KEYS.ENERGY_MENU_ITEMS);
  return items ?? [];
}

/**
 * Save all Energy Menu items to storage
 */
export async function saveEnergyMenuItems(items: EnergyMenuItem[]): Promise<void> {
  await setItem(KEYS.ENERGY_MENU_ITEMS, items);
}

/**
 * Create a new Energy Menu item
 */
export async function createEnergyMenuItem(item: Omit<EnergyMenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnergyMenuItem> {
  const items = await loadEnergyMenuItems();
  const now = Date.now();
  const newItem: EnergyMenuItem = {
    ...item,
    id: `energy-item-${now}`,
    createdAt: now,
    updatedAt: now,
  };
  items.push(newItem);
  await saveEnergyMenuItems(items);
  return newItem;
}

/**
 * Update an existing Energy Menu item
 */
export async function updateEnergyMenuItem(
  id: string,
  updates: Partial<Omit<EnergyMenuItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const items = await loadEnergyMenuItems();
  const index = items.findIndex(item => item.id === id);
  if (index === -1) {
    throw new Error(`Energy Menu item ${id} not found`);
  }
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: Date.now(),
  };
  await saveEnergyMenuItems(items);
}

/**
 * Delete an Energy Menu item
 */
export async function deleteEnergyMenuItem(id: string): Promise<void> {
  const items = await loadEnergyMenuItems();
  const filtered = items.filter(item => item.id !== id);
  await saveEnergyMenuItems(filtered);
}

/**
 * Get Energy Menu items by energy level
 */
export async function getEnergyMenuItemsByLevel(level: 'low' | 'steady' | 'flow'): Promise<EnergyMenuItem[]> {
  const items = await loadEnergyMenuItems();
  return items.filter(item => item.energyLevel === level);
}
