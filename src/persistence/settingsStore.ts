/**
 * settingsStore.ts
 * Persistence for user settings with migration support.
 */

import { Settings, DEFAULT_SETTINGS, CURRENT_SETTINGS_VERSION } from '../models/Settings';
import { getItem, setItem, KEYS } from './storage';

/**
 * Migration function type.
 */
type MigrationFn = (oldSettings: any) => any;

/**
 * Migration functions for each version upgrade.
 * migrations[0] migrates version 0 (no version) to version 1.
 */
const migrations: MigrationFn[] = [
  // Migration 0 -> 1: Add version field to existing settings
  (oldSettings: any) => {
    return {
      ...oldSettings,
      version: 1,
    };
  },
];

/**
 * Runs all necessary migrations on settings.
 */
function migrateSettings(settings: any): Settings {
  let currentVersion = settings.version ?? 0;

  // Apply migrations sequentially
  while (currentVersion < CURRENT_SETTINGS_VERSION) {
    const migration = migrations[currentVersion];
    if (migration) {
      settings = migration(settings);
      currentVersion++;
    } else {
      console.warn(`No migration found for version ${currentVersion}`);
      break;
    }
  }

  return settings;
}

/**
 * Loads settings from storage.
 * Applies migrations and merges with defaults to ensure all fields are present.
 */
export async function loadSettings(): Promise<Settings> {
  const storedSettings = await getItem<any>(KEYS.SETTINGS);

  if (!storedSettings) {
    return DEFAULT_SETTINGS;
  }

  // Apply migrations if needed
  const migratedSettings = migrateSettings(storedSettings);

  // Merge with defaults to handle any new fields added in updates
  const settings = { ...DEFAULT_SETTINGS, ...migratedSettings };

  // If settings were migrated, save the updated version
  if (storedSettings.version !== CURRENT_SETTINGS_VERSION) {
    await saveSettings(settings);
  }

  return settings;
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
