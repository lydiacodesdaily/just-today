/**
 * guidesStore.ts
 * Storage operations for Guides
 *
 * What we persist:
 * - Custom guides created by user
 * - Active session state (if app is backgrounded)
 *
 * What we DON'T persist:
 * - Completion history
 * - Usage statistics
 * - Checked items (except active session)
 */

import { Guide, GuideSession } from '../models/Guide';
import { getItem, setItem, removeItem, KEYS } from './storage';

/**
 * Load all custom guides
 */
export async function loadCustomGuides(): Promise<Guide[]> {
  try {
    const guides = await getItem<Guide[]>(KEYS.CUSTOM_GUIDES);
    return guides || [];
  } catch (error) {
    console.error('Failed to load custom guides:', error);
    return [];
  }
}

/**
 * Save all custom guides
 */
async function saveCustomGuides(guides: Guide[]): Promise<void> {
  try {
    await setItem(KEYS.CUSTOM_GUIDES, guides);
  } catch (error) {
    console.error('Failed to save custom guides:', error);
  }
}

/**
 * Add a new custom guide
 */
export async function addCustomGuide(guide: Guide): Promise<void> {
  const guides = await loadCustomGuides();
  guides.push(guide);
  await saveCustomGuides(guides);
}

/**
 * Update an existing custom guide
 */
export async function updateCustomGuide(guideId: string, updates: Partial<Guide>): Promise<void> {
  const guides = await loadCustomGuides();
  const guideIndex = guides.findIndex((g) => g.id === guideId);

  if (guideIndex === -1) return;

  guides[guideIndex] = {
    ...guides[guideIndex],
    ...updates,
  };

  await saveCustomGuides(guides);
}

/**
 * Delete a custom guide
 */
export async function deleteCustomGuide(guideId: string): Promise<void> {
  const guides = await loadCustomGuides();
  const filteredGuides = guides.filter((g) => g.id !== guideId);
  await saveCustomGuides(filteredGuides);
}

/**
 * Get a specific custom guide by ID
 */
export async function getCustomGuide(guideId: string): Promise<Guide | null> {
  const guides = await loadCustomGuides();
  return guides.find((g) => g.id === guideId) || null;
}

/**
 * Count custom guides (for free tier limit check)
 */
export async function countCustomGuides(): Promise<number> {
  const guides = await loadCustomGuides();
  return guides.length;
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Load active guide session (if exists)
 */
export async function loadActiveSession(): Promise<GuideSession | null> {
  try {
    const session = await getItem<GuideSession>(KEYS.ACTIVE_GUIDE_SESSION);

    // Check if session is stale (>60 minutes old)
    if (session) {
      const lastActivity = new Date(session.lastActivityAt);
      const now = new Date();
      const minutesInactive = (now.getTime() - lastActivity.getTime()) / 1000 / 60;

      if (minutesInactive >= 60) {
        // Auto-clear stale session
        await clearActiveSession();
        return null;
      }
    }

    return session;
  } catch (error) {
    console.error('Failed to load active session:', error);
    return null;
  }
}

/**
 * Save active guide session
 */
export async function saveActiveSession(session: GuideSession): Promise<void> {
  try {
    await setItem(KEYS.ACTIVE_GUIDE_SESSION, session);
  } catch (error) {
    console.error('Failed to save active session:', error);
  }
}

/**
 * Clear active guide session
 */
export async function clearActiveSession(): Promise<void> {
  try {
    await removeItem(KEYS.ACTIVE_GUIDE_SESSION);
  } catch (error) {
    console.error('Failed to clear active session:', error);
  }
}
