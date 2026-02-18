/**
 * weeklyIntentStore.ts
 * Storage operations for weekly intent planning and review.
 */

import {
  WeeklyIntent,
  WeeklyIntentItem,
  createWeeklyIntent,
  createWeeklyIntentItem,
} from '../models/WeeklyIntent';
import { getItem, setItem, KEYS } from './storage';

async function loadWeeklyIntents(): Promise<WeeklyIntent[]> {
  try {
    const intents = await getItem<WeeklyIntent[]>(KEYS.WEEKLY_INTENTS);
    return intents || [];
  } catch (error) {
    console.error('Failed to load weekly intents:', error);
    return [];
  }
}

async function saveWeeklyIntents(intents: WeeklyIntent[]): Promise<void> {
  try {
    await setItem(KEYS.WEEKLY_INTENTS, intents);
  } catch (error) {
    console.error('Failed to save weekly intents:', error);
  }
}

/**
 * Get the current active or planning intent (most recent non-reviewed)
 */
export async function getActiveIntent(): Promise<WeeklyIntent | null> {
  const intents = await loadWeeklyIntents();
  return intents.find((i) => i.status === 'active' || i.status === 'planning') || null;
}

/**
 * Get all intents (for history)
 */
export async function getAllIntents(): Promise<WeeklyIntent[]> {
  return loadWeeklyIntents();
}

/**
 * Get or create an intent for the given week start date
 */
export async function getOrCreateIntent(weekStartDate: string): Promise<WeeklyIntent> {
  const intents = await loadWeeklyIntents();
  const existing = intents.find((i) => i.weekStartDate === weekStartDate);

  if (existing) return existing;

  const newIntent = createWeeklyIntent(weekStartDate);
  intents.unshift(newIntent);
  await saveWeeklyIntents(intents);
  return newIntent;
}

/**
 * Add a focus item to an intent
 */
export async function addItemToIntent(
  intentId: string,
  focusItemId: string,
  title: string
): Promise<void> {
  const intents = await loadWeeklyIntents();
  const intentIndex = intents.findIndex((i) => i.id === intentId);
  if (intentIndex === -1) return;

  // Don't add duplicates
  if (intents[intentIndex].items.some((item) => item.focusItemId === focusItemId)) return;

  const newItem = createWeeklyIntentItem(focusItemId, title);
  intents[intentIndex] = {
    ...intents[intentIndex],
    items: [...intents[intentIndex].items, newItem],
  };

  await saveWeeklyIntents(intents);
}

/**
 * Remove an item from an intent
 */
export async function removeItemFromIntent(intentId: string, itemId: string): Promise<void> {
  const intents = await loadWeeklyIntents();
  const intentIndex = intents.findIndex((i) => i.id === intentId);
  if (intentIndex === -1) return;

  intents[intentIndex] = {
    ...intents[intentIndex],
    items: intents[intentIndex].items.filter((item) => item.id !== itemId),
  };

  await saveWeeklyIntents(intents);
}

/**
 * Toggle priority flag on an intent item
 */
export async function toggleItemPriority(intentId: string, itemId: string): Promise<void> {
  const intents = await loadWeeklyIntents();
  const intentIndex = intents.findIndex((i) => i.id === intentId);
  if (intentIndex === -1) return;

  intents[intentIndex] = {
    ...intents[intentIndex],
    items: intents[intentIndex].items.map((item) =>
      item.id === itemId ? { ...item, isPriority: !item.isPriority } : item
    ),
  };

  await saveWeeklyIntents(intents);
}

/**
 * Activate an intent (transition from planning to active)
 */
export async function activateIntent(intentId: string): Promise<void> {
  const intents = await loadWeeklyIntents();
  const intentIndex = intents.findIndex((i) => i.id === intentId);
  if (intentIndex === -1) return;

  intents[intentIndex] = {
    ...intents[intentIndex],
    status: 'active',
    activatedAt: new Date().toISOString(),
  };

  await saveWeeklyIntents(intents);
}

/**
 * Mark an intent item as completed (called when its FocusItem is completed)
 */
export async function markItemCompleted(intentId: string, focusItemId: string): Promise<void> {
  const intents = await loadWeeklyIntents();
  const intentIndex = intents.findIndex((i) => i.id === intentId);
  if (intentIndex === -1) return;

  intents[intentIndex] = {
    ...intents[intentIndex],
    items: intents[intentIndex].items.map((item) =>
      item.focusItemId === focusItemId && item.outcome === 'pending'
        ? { ...item, completedAt: new Date().toISOString(), outcome: 'completed' as const }
        : item
    ),
  };

  await saveWeeklyIntents(intents);
}

/**
 * Set the outcome for an intent item during review
 */
export async function setItemOutcome(
  intentId: string,
  itemId: string,
  outcome: WeeklyIntentItem['outcome']
): Promise<void> {
  const intents = await loadWeeklyIntents();
  const intentIndex = intents.findIndex((i) => i.id === intentId);
  if (intentIndex === -1) return;

  intents[intentIndex] = {
    ...intents[intentIndex],
    items: intents[intentIndex].items.map((item) =>
      item.id === itemId ? { ...item, outcome } : item
    ),
  };

  await saveWeeklyIntents(intents);
}

/**
 * Finalize the review for an intent
 */
export async function finalizeReview(intentId: string, reviewNote?: string): Promise<void> {
  const intents = await loadWeeklyIntents();
  const intentIndex = intents.findIndex((i) => i.id === intentId);
  if (intentIndex === -1) return;

  intents[intentIndex] = {
    ...intents[intentIndex],
    status: 'reviewed',
    reviewedAt: new Date().toISOString(),
    reviewNote,
  };

  await saveWeeklyIntents(intents);
}

/**
 * Sync completion status by checking FocusItems.
 * Pass in all focus items so we can check completedAt.
 */
export async function syncCompletionsWithFocusItems(
  focusItems: { id: string; completedAt?: string }[]
): Promise<boolean> {
  const intents = await loadWeeklyIntents();
  const activeIntent = intents.find((i) => i.status === 'active');
  if (!activeIntent) return false;

  const completedMap = new Map(
    focusItems.filter((fi) => fi.completedAt).map((fi) => [fi.id, fi.completedAt!])
  );

  let changed = false;
  const updatedItems = activeIntent.items.map((item) => {
    if (item.outcome === 'pending' && completedMap.has(item.focusItemId)) {
      changed = true;
      return {
        ...item,
        completedAt: completedMap.get(item.focusItemId)!,
        outcome: 'completed' as const,
      };
    }
    return item;
  });

  if (changed) {
    const intentIndex = intents.findIndex((i) => i.id === activeIntent.id);
    intents[intentIndex] = { ...activeIntent, items: updatedItems };
    await saveWeeklyIntents(intents);
  }

  return changed;
}

/**
 * Clean up intents older than 8 weeks
 */
export async function cleanupOldIntents(): Promise<void> {
  const intents = await loadWeeklyIntents();
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  const cutoff = eightWeeksAgo.toISOString().split('T')[0];

  const recentIntents = intents.filter((i) => i.weekStartDate >= cutoff);
  if (recentIntents.length !== intents.length) {
    await saveWeeklyIntents(recentIntents);
  }
}
