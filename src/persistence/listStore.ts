/**
 * listStore.ts
 * Storage operations for Lists and ListItems.
 */

import { List, ListItem, createList, createListItem } from '../models/List';
import { getItem, setItem, KEYS } from './storage';

// ─── Lists ────────────────────────────────────────────────────────────────────

export async function loadLists(): Promise<List[]> {
  try {
    const lists = await getItem<List[]>(KEYS.LISTS);
    return lists || [];
  } catch (error) {
    console.error('Failed to load lists:', error);
    return [];
  }
}

async function saveLists(lists: List[]): Promise<void> {
  try {
    await setItem(KEYS.LISTS, lists);
  } catch (error) {
    console.error('Failed to save lists:', error);
  }
}

export async function addList(name: string, emoji?: string): Promise<List> {
  const lists = await loadLists();
  const newList = createList(name, emoji);
  lists.push(newList);
  await saveLists(lists);
  return newList;
}

export async function renameList(listId: string, name: string): Promise<void> {
  const lists = await loadLists();
  const index = lists.findIndex((l) => l.id === listId);
  if (index === -1) return;
  lists[index] = { ...lists[index], name: name.trim() };
  await saveLists(lists);
}

export async function updateListEmoji(listId: string, emoji: string | undefined): Promise<void> {
  const lists = await loadLists();
  const index = lists.findIndex((l) => l.id === listId);
  if (index === -1) return;
  lists[index] = { ...lists[index], emoji };
  await saveLists(lists);
}

export async function deleteList(listId: string): Promise<void> {
  const lists = await loadLists();
  await saveLists(lists.filter((l) => l.id !== listId));

  // Also remove all items for this list
  const allItems = await loadAllListItems();
  await saveAllListItems(allItems.filter((item) => item.listId !== listId));
}

// ─── List Items ───────────────────────────────────────────────────────────────

export async function loadAllListItems(): Promise<ListItem[]> {
  try {
    const items = await getItem<ListItem[]>(KEYS.LIST_ITEMS);
    return items || [];
  } catch (error) {
    console.error('Failed to load list items:', error);
    return [];
  }
}

async function saveAllListItems(items: ListItem[]): Promise<void> {
  try {
    await setItem(KEYS.LIST_ITEMS, items);
  } catch (error) {
    console.error('Failed to save list items:', error);
  }
}

export async function loadListItems(listId: string): Promise<ListItem[]> {
  const allItems = await loadAllListItems();
  return allItems
    .filter((item) => item.listId === listId)
    .sort((a, b) => {
      // Unchecked first, then checked; within each group, sort by order
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      return a.order - b.order;
    });
}

export async function addListItem(listId: string, text: string): Promise<ListItem> {
  const allItems = await loadAllListItems();
  const listItems = allItems.filter((i) => i.listId === listId);
  const maxOrder = listItems.length > 0 ? Math.max(...listItems.map((i) => i.order)) : -1;
  const newItem = createListItem(listId, text, maxOrder + 1);
  allItems.push(newItem);
  await saveAllListItems(allItems);
  return newItem;
}

export async function toggleListItem(itemId: string): Promise<void> {
  const allItems = await loadAllListItems();
  const index = allItems.findIndex((i) => i.id === itemId);
  if (index === -1) return;
  allItems[index] = { ...allItems[index], checked: !allItems[index].checked };
  await saveAllListItems(allItems);
}

export async function deleteListItem(itemId: string): Promise<void> {
  const allItems = await loadAllListItems();
  await saveAllListItems(allItems.filter((i) => i.id !== itemId));
}

export async function clearCheckedItems(listId: string): Promise<void> {
  const allItems = await loadAllListItems();
  await saveAllListItems(allItems.filter((i) => !(i.listId === listId && i.checked)));
}
