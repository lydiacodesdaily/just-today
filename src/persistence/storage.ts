/**
 * storage.ts
 * AsyncStorage wrapper with type safety.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TEMPLATES: '@just-today/templates',
  SETTINGS: '@just-today/settings',
  CURRENT_ENERGY: '@just-today/current-energy',
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
