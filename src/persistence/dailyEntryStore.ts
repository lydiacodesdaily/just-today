/**
 * dailyEntryStore.ts
 * AsyncStorage operations for the daily first-entry check-in.
 * Once-per-day nervous-system reset entry point.
 */

import {
  DailyEntry,
  DailyEmotion,
  createDailyEntry,
  isFromToday,
  getTodayDateKey,
} from '../models/DailyEntry';
import { getItem, setItem, KEYS } from './storage';

/**
 * Load all daily entries
 */
export async function loadDailyEntries(): Promise<DailyEntry[]> {
  try {
    const entries = await getItem<DailyEntry[]>(KEYS.DAILY_ENTRY);
    return entries || [];
  } catch (error) {
    console.error('Failed to load daily entries:', error);
    return [];
  }
}

/**
 * Load today's entry (null if none exists)
 */
export async function loadTodayEntry(): Promise<DailyEntry | null> {
  const entries = await loadDailyEntries();
  return entries.find(isFromToday) ?? null;
}

/**
 * Save a new daily entry for today
 */
export async function saveDailyEntry(
  text: string,
  emotion?: DailyEmotion
): Promise<DailyEntry> {
  const entries = await loadDailyEntries();
  const newEntry = createDailyEntry(text, emotion);
  entries.push(newEntry);

  try {
    await setItem(KEYS.DAILY_ENTRY, entries);
  } catch (error) {
    console.error('Failed to save daily entry:', error);
  }

  return newEntry;
}

/**
 * Load the date the user last dismissed the first-entry flow without submitting
 */
export async function loadDismissedDate(): Promise<string | null> {
  try {
    return await getItem<string>(KEYS.DAILY_ENTRY_DISMISSED);
  } catch (error) {
    console.error('Failed to load dismissed date:', error);
    return null;
  }
}

/**
 * Record that the user dismissed the first-entry flow today without submitting
 */
export async function saveDismissedDate(date: string): Promise<void> {
  try {
    await setItem(KEYS.DAILY_ENTRY_DISMISSED, date);
  } catch (error) {
    console.error('Failed to save dismissed date:', error);
  }
}

/**
 * Whether the first-entry flow should be shown.
 * True if: no entry exists for today AND user hasn't dismissed today.
 */
export function shouldShowFirstEntry(
  todayEntry: DailyEntry | null,
  dismissedDate: string | null
): boolean {
  if (todayEntry !== null) return false;
  if (dismissedDate === getTodayDateKey()) return false;
  return true;
}
