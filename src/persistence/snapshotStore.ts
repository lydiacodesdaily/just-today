/**
 * snapshotStore.ts
 * Storage operations for daily snapshots
 */

import { DailySnapshot, createEmptySnapshot, formatDateKey } from '../models/DailySnapshot';
import { getItem, setItem, KEYS } from './storage';

const SNAPSHOT_RETENTION_DAYS = 30; // Keep last 30 days

/**
 * Load all snapshots
 */
export async function loadSnapshots(): Promise<Record<string, DailySnapshot>> {
  try {
    const snapshots = await getItem<Record<string, DailySnapshot>>(KEYS.DAILY_SNAPSHOTS);
    return snapshots || {};
  } catch (error) {
    console.error('Failed to load snapshots:', error);
    return {};
  }
}

/**
 * Load snapshot for a specific date
 */
export async function loadSnapshotForDate(date: Date): Promise<DailySnapshot> {
  const dateKey = formatDateKey(date);
  const snapshots = await loadSnapshots();
  return snapshots[dateKey] || createEmptySnapshot(dateKey);
}

/**
 * Load snapshot for today
 */
export async function loadTodaySnapshot(): Promise<DailySnapshot> {
  return loadSnapshotForDate(new Date());
}

/**
 * Save all snapshots
 */
async function saveSnapshots(snapshots: Record<string, DailySnapshot>): Promise<void> {
  try {
    await setItem(KEYS.DAILY_SNAPSHOTS, snapshots);
  } catch (error) {
    console.error('Failed to save snapshots:', error);
  }
}

/**
 * Update or create a snapshot for a specific date
 */
export async function updateSnapshot(
  date: Date,
  updates: Partial<DailySnapshot>
): Promise<void> {
  const dateKey = formatDateKey(date);
  const snapshots = await loadSnapshots();

  const existingSnapshot = snapshots[dateKey] || createEmptySnapshot(dateKey);

  snapshots[dateKey] = {
    ...existingSnapshot,
    ...updates,
    date: dateKey, // Ensure date doesn't get overwritten
  };

  await saveSnapshots(snapshots);
}

/**
 * Increment a counter in today's snapshot
 */
export async function incrementTodayCounter(
  field: 'focusItemsCompleted' | 'routineRunsCompleted' | 'itemsMovedToLater'
): Promise<void> {
  const today = new Date();
  const snapshot = await loadTodaySnapshot();

  await updateSnapshot(today, {
    [field]: snapshot[field] + 1,
    lastActivityAt: new Date().toISOString(),
  });
}

/**
 * Add focus time to today's snapshot
 */
export async function addFocusTime(durationMs: number): Promise<void> {
  const today = new Date();
  const snapshot = await loadTodaySnapshot();

  await updateSnapshot(today, {
    totalFocusTimeMs: snapshot.totalFocusTimeMs + durationMs,
    lastActivityAt: new Date().toISOString(),
  });
}

/**
 * Add energy mode to today's snapshot (if not already added)
 */
export async function addEnergyMode(energyMode: 'low' | 'steady' | 'flow'): Promise<void> {
  const today = new Date();
  const snapshot = await loadTodaySnapshot();

  // Only add if not already in the list
  if (!snapshot.energyModesSelected.includes(energyMode)) {
    const now = new Date().toISOString();

    await updateSnapshot(today, {
      energyModesSelected: [...snapshot.energyModesSelected, energyMode],
      lastActivityAt: now,
      // Set first activity if not set
      firstActivityAt: snapshot.firstActivityAt || now,
    });
  }
}

/**
 * Add completed tasks count to today's snapshot
 * Used to track progress even when routines are abandoned
 */
export async function addCompletedTasks(count: number): Promise<void> {
  const today = new Date();
  const snapshot = await loadTodaySnapshot();

  await updateSnapshot(today, {
    tasksCompletedInRoutines: snapshot.tasksCompletedInRoutines + count,
    lastActivityAt: new Date().toISOString(),
  });
}

/**
 * Get snapshots for the last N days
 */
export async function getRecentSnapshots(days: number): Promise<DailySnapshot[]> {
  const snapshots = await loadSnapshots();
  const result: DailySnapshot[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = formatDateKey(date);

    result.push(snapshots[dateKey] || createEmptySnapshot(dateKey));
  }

  return result;
}

/**
 * Get snapshots for a specific week (7 days starting from Sunday)
 */
export async function getWeekSnapshots(weekStartDate: Date): Promise<DailySnapshot[]> {
  const snapshots = await loadSnapshots();
  const result: DailySnapshot[] = [];

  // Normalize to start of day
  const current = new Date(weekStartDate);
  current.setHours(0, 0, 0, 0);

  // Get to start of week (Sunday)
  const dayOfWeek = current.getDay();
  current.setDate(current.getDate() - dayOfWeek);

  // Get 7 days
  for (let i = 0; i < 7; i++) {
    const dateKey = formatDateKey(current);
    result.push(snapshots[dateKey] || createEmptySnapshot(dateKey));
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * Clean up old snapshots (keep only last N days)
 */
export async function cleanupOldSnapshots(): Promise<void> {
  try {
    const snapshots = await loadSnapshots();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - SNAPSHOT_RETENTION_DAYS);
    const cutoffKey = formatDateKey(cutoffDate);

    const recentSnapshots: Record<string, DailySnapshot> = {};

    Object.entries(snapshots).forEach(([dateKey, snapshot]) => {
      if (dateKey >= cutoffKey) {
        recentSnapshots[dateKey] = snapshot;
      }
    });

    await saveSnapshots(recentSnapshots);
  } catch (error) {
    console.error('Failed to cleanup old snapshots:', error);
  }
}

/**
 * Check if today has any activity
 */
export async function hasTodayActivity(): Promise<boolean> {
  const snapshot = await loadTodaySnapshot();
  return (
    snapshot.focusItemsCompleted > 0 ||
    snapshot.routineRunsCompleted > 0 ||
    snapshot.totalFocusTimeMs > 0
  );
}
