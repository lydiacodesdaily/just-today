/**
 * runStateStore.ts
 * Persistence for active routine run state.
 */

import { RoutineRun } from '../models/RoutineRun';
import { getItem, setItem, removeItem, KEYS } from './storage';

/**
 * Saves the current run state to persistent storage.
 */
export async function saveRunState(run: RoutineRun): Promise<void> {
  await setItem(KEYS.ACTIVE_RUN, run);
}

/**
 * Loads the saved run state from persistent storage.
 */
export async function loadRunState(): Promise<RoutineRun | null> {
  return await getItem<RoutineRun>(KEYS.ACTIVE_RUN);
}

/**
 * Clears the saved run state.
 */
export async function clearRunState(): Promise<void> {
  await removeItem(KEYS.ACTIVE_RUN);
}
