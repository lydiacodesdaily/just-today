/**
 * settingsStore.ts
 * Persistence for user settings.
 */

import { Settings, DEFAULT_SETTINGS } from '../models/Settings';
import { getItem, setItem, KEYS } from './storage';

/**
 * Loads settings from storage.
 */
export async function loadSettings(): Promise<Settings> {
  const settings = await getItem<Settings>(KEYS.SETTINGS);
  return settings || DEFAULT_SETTINGS;
}

/**
 * Saves settings to storage.
 */
export async function saveSettings(settings: Settings): Promise<void> {
  await setItem(KEYS.SETTINGS, settings);
}

/**
 * Updates specific settings fields.
 */
export async function updateSettings(
  updates: Partial<Settings>
): Promise<Settings> {
  const current = await loadSettings();
  const updated = { ...current, ...updates };
  await saveSettings(updated);
  return updated;
}
