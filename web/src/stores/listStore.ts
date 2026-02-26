/**
 * listStore.ts
 * Zustand store for Lists and ListItems.
 * Lists are lightweight reusable checklists (groceries, books, packing).
 * They are NOT tasks — no time estimates, deadlines, or projects.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { List, ListItem, createList, createListItem } from '@/src/models/List';

interface ListStore {
  lists: List[];
  listItems: ListItem[];

  // List operations
  addList: (name: string, emoji?: string) => List;
  renameList: (id: string, name: string) => void;
  updateListEmoji: (id: string, emoji: string | undefined) => void;
  deleteList: (id: string) => void;

  // Item operations
  getItemsForList: (listId: string) => ListItem[];
  addListItem: (listId: string, text: string) => ListItem;
  toggleListItem: (itemId: string) => void;
  deleteListItem: (itemId: string) => void;
  clearCheckedItems: (listId: string) => void;
}

export const useListStore = create<ListStore>()(
  persist(
    (set, get) => ({
      lists: [],
      listItems: [],

      addList: (name, emoji) => {
        const list = createList(name, emoji);
        set((state) => ({ lists: [...state.lists, list] }));
        return list;
      },

      renameList: (id, name) => {
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === id ? { ...l, name: name.trim() } : l
          ),
        }));
      },

      updateListEmoji: (id, emoji) => {
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === id ? { ...l, emoji } : l
          ),
        }));
      },

      deleteList: (id) => {
        set((state) => ({
          lists: state.lists.filter((l) => l.id !== id),
          listItems: state.listItems.filter((i) => i.listId !== id),
        }));
      },

      getItemsForList: (listId) => {
        return get()
          .listItems.filter((i) => i.listId === listId)
          .sort((a, b) => {
            // Unchecked first, then checked; within each group sort by order
            if (a.checked !== b.checked) return a.checked ? 1 : -1;
            return a.order - b.order;
          });
      },

      addListItem: (listId, text) => {
        const items = get().listItems.filter((i) => i.listId === listId);
        const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.order)) : -1;
        const newItem = createListItem(listId, text, maxOrder + 1);
        set((state) => ({ listItems: [...state.listItems, newItem] }));
        return newItem;
      },

      toggleListItem: (itemId) => {
        set((state) => ({
          listItems: state.listItems.map((i) =>
            i.id === itemId ? { ...i, checked: !i.checked } : i
          ),
        }));
      },

      deleteListItem: (itemId) => {
        set((state) => ({
          listItems: state.listItems.filter((i) => i.id !== itemId),
        }));
      },

      clearCheckedItems: (listId) => {
        set((state) => ({
          listItems: state.listItems.filter(
            (i) => !(i.listId === listId && i.checked)
          ),
        }));
      },
    }),
    {
      name: 'lists-storage',
    }
  )
);
