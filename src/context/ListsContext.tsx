/**
 * ListsContext.tsx
 * Context provider for managing Lists and their items.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { List, ListItem } from '../models/List';
import {
  loadLists,
  addList as persistAddList,
  renameList as persistRenameList,
  updateListEmoji as persistUpdateListEmoji,
  deleteList as persistDeleteList,
  loadListItems as persistLoadListItems,
  addListItem as persistAddListItem,
  toggleListItem as persistToggleListItem,
  deleteListItem as persistDeleteListItem,
  clearCheckedItems as persistClearCheckedItems,
} from '../persistence/listStore';

interface ListsContextValue {
  lists: List[];
  isLoading: boolean;

  addList: (name: string, emoji?: string) => Promise<List>;
  renameList: (listId: string, name: string) => Promise<void>;
  updateListEmoji: (listId: string, emoji: string | undefined) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  refreshLists: () => Promise<void>;

  // Items — loaded per-list on demand
  loadItemsForList: (listId: string) => Promise<ListItem[]>;
  addListItem: (listId: string, text: string) => Promise<ListItem>;
  toggleListItem: (itemId: string, listId: string) => Promise<ListItem[]>;
  deleteListItem: (itemId: string, listId: string) => Promise<ListItem[]>;
  clearCheckedItems: (listId: string) => Promise<ListItem[]>;
}

const ListsContext = createContext<ListsContextValue | undefined>(undefined);

export function ListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await loadLists();
      setLists(loaded);
    } catch (error) {
      console.error('Failed to load lists:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addList = useCallback(async (name: string, emoji?: string): Promise<List> => {
    const newList = await persistAddList(name, emoji);
    setLists((prev) => [...prev, newList]);
    return newList;
  }, []);

  const renameList = useCallback(async (listId: string, name: string): Promise<void> => {
    await persistRenameList(listId, name);
    setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, name: name.trim() } : l)));
  }, []);

  const updateListEmoji = useCallback(
    async (listId: string, emoji: string | undefined): Promise<void> => {
      await persistUpdateListEmoji(listId, emoji);
      setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, emoji } : l)));
    },
    []
  );

  const deleteList = useCallback(async (listId: string): Promise<void> => {
    await persistDeleteList(listId);
    setLists((prev) => prev.filter((l) => l.id !== listId));
  }, []);

  const refreshLists = useCallback(async (): Promise<void> => {
    await load();
  }, [load]);

  // Item operations — return refreshed item list for the detail screen
  const loadItemsForList = useCallback(async (listId: string): Promise<ListItem[]> => {
    return persistLoadListItems(listId);
  }, []);

  const addListItem = useCallback(async (listId: string, text: string): Promise<ListItem> => {
    return persistAddListItem(listId, text);
  }, []);

  const toggleListItem = useCallback(
    async (itemId: string, listId: string): Promise<ListItem[]> => {
      await persistToggleListItem(itemId);
      return persistLoadListItems(listId);
    },
    []
  );

  const deleteListItem = useCallback(
    async (itemId: string, listId: string): Promise<ListItem[]> => {
      await persistDeleteListItem(itemId);
      return persistLoadListItems(listId);
    },
    []
  );

  const clearCheckedItems = useCallback(async (listId: string): Promise<ListItem[]> => {
    await persistClearCheckedItems(listId);
    return persistLoadListItems(listId);
  }, []);

  const value: ListsContextValue = useMemo(
    () => ({
      lists,
      isLoading,
      addList,
      renameList,
      updateListEmoji,
      deleteList,
      refreshLists,
      loadItemsForList,
      addListItem,
      toggleListItem,
      deleteListItem,
      clearCheckedItems,
    }),
    [
      lists,
      isLoading,
      addList,
      renameList,
      updateListEmoji,
      deleteList,
      refreshLists,
      loadItemsForList,
      addListItem,
      toggleListItem,
      deleteListItem,
      clearCheckedItems,
    ]
  );

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

export function useLists(): ListsContextValue {
  const context = useContext(ListsContext);
  if (!context) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return context;
}
