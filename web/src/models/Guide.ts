/**
 * Guide Models
 *
 * Transitions are ephemeral checklists for context changes.
 * They are NOT tasks, habits, or goals.
 * No tracking, no streaks, no analytics.
 */

export interface GuideItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Guide {
  id: string;
  title: string;
  items: GuideItem[];
  isDefault: boolean;
  createdAt?: string;
}

export interface GuideSession {
  guideId: string;
  checkedItems: string[]; // Item IDs that are currently checked
  lastActivityAt: string; // ISO timestamp
}

/**
 * Helper to create a new guide item
 */
export function createGuideItem(text: string): GuideItem {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    text,
    checked: false,
  };
}

/**
 * Helper to create a new custom guide
 */
export function createCustomGuide(title: string, items: string[]): Guide {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    title,
    items: items.map(createGuideItem),
    isDefault: false,
    createdAt: new Date().toISOString(),
  };
}
