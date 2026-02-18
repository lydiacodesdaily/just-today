/**
 * storage.ts
 * AsyncStorage wrapper with type safety.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TEMPLATES: '@just-today/templates',
  SETTINGS: '@just-today/settings',
  CURRENT_PACE: '@just-today/current-pace',
  PACE_SELECTED_DATE: '@just-today/pace-selected-date',
  ACTIVE_RUN: '@just-today/active-run',
  PACE_PICKS: '@just-today/pace-picks',
  TODAY_OPTIONAL_ITEMS: '@just-today/today-optional-items',
  TODAY_DATE: '@just-today/today-date',
  FOCUS_ITEMS: '@just-today/focus-items',
  FOCUS_TODAY_DATE: '@just-today/focus-today-date',
  BRAIN_DUMP_ITEMS: '@just-today/brain-dump-items',
  DAILY_SNAPSHOTS: '@just-today/daily-snapshots',
  CUSTOM_GUIDES: '@just-today/custom-guides',
  ACTIVE_GUIDE_SESSION: '@just-today/active-guide-session',
  DAYLINE_ITEMS: '@just-today/dayline-items',
  PROJECTS: '@just-today/projects',
  WEEKLY_INTENTS: '@just-today/weekly-intents',
} as const;

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Failed to get item ${key}:`, error);
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set item ${key}:`, error);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove item ${key}:`, error);
  }
}

export { KEYS };
