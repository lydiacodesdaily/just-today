/**
 * List.ts
 * A simple, reusable checklist or reference collection.
 * Examples: grocery, books to read, wishlist, shows to watch.
 *
 * Lists are NOT tasks — no time estimates, deadlines, or projects.
 */

export interface List {
  id: string;
  name: string;
  emoji?: string;
  createdAt: string; // ISO date string
}

export interface ListItem {
  id: string;
  listId: string;
  text: string;
  checked: boolean;
  createdAt: string; // ISO date string
  order: number;
}

export function createList(name: string, emoji?: string): List {
  const randomId = Math.random().toString(36).substr(2, 9);
  return {
    id: `list-${Date.now()}-${randomId}`,
    name: name.trim(),
    emoji,
    createdAt: new Date().toISOString(),
  };
}

export function createListItem(listId: string, text: string, order: number): ListItem {
  const randomId = Math.random().toString(36).substr(2, 9);
  return {
    id: `listitem-${Date.now()}-${randomId}`,
    listId,
    text: text.trim(),
    checked: false,
    createdAt: new Date().toISOString(),
    order,
  };
}
