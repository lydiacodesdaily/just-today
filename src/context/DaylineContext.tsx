/**
 * DaylineContext.tsx
 * Context provider for managing Dayline items - one-line memory captures
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { Pace } from '../models/RoutineTemplate';
import { DaylineItem } from '../models/DaylineItem';
import {
  loadTodayDaylineItems,
  loadPreviousDaylineItems,
  addDaylineItem,
  updateDaylineItem,
  updateDaylineItemMood,
  deleteDaylineItem,
  cleanupOldDaylineItems,
} from '../persistence/daylineStore';

interface DaylineContextValue {
  // State
  todayItems: DaylineItem[];
  previousItems: DaylineItem[];
  isLoading: boolean;

  // Actions
  addItem: (text: string, mood?: Pace) => Promise<DaylineItem>;
  updateItem: (itemId: string, newText: string) => Promise<void>;
  updateMood: (itemId: string, mood: Pace | undefined) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

const DaylineContext = createContext<DaylineContextValue | undefined>(
  undefined
);

export function DaylineProvider({ children }: { children: ReactNode }) {
  const [todayItems, setTodayItems] = useState<DaylineItem[]>([]);
  const [previousItems, setPreviousItems] = useState<DaylineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load items on mount
  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const [today, previous] = await Promise.all([
        loadTodayDaylineItems(),
        loadPreviousDaylineItems(),
      ]);
      setTodayItems(today);
      setPreviousItems(previous);
    } catch (error) {
      console.error('Failed to load dayline items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Cleanup old items periodically (every hour)
  useEffect(() => {
    const interval = setInterval(async () => {
      await cleanupOldDaylineItems();
      await loadItems();
    }, 3600000); // Check every hour

    return () => clearInterval(interval);
  }, [loadItems]);

  // Actions
  const addItem = async (text: string, mood?: Pace): Promise<DaylineItem> => {
    const newItem = await addDaylineItem(text, mood);
    setTodayItems((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateItem = async (
    itemId: string,
    newText: string
  ): Promise<void> => {
    await updateDaylineItem(itemId, newText);
    setTodayItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, text: newText } : item
      )
    );
    setPreviousItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, text: newText } : item
      )
    );
  };

  const updateMood = async (
    itemId: string,
    mood: Pace | undefined
  ): Promise<void> => {
    await updateDaylineItemMood(itemId, mood);
    setTodayItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, mood } : item))
    );
    setPreviousItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, mood } : item))
    );
  };

  const deleteItem = async (itemId: string): Promise<void> => {
    await deleteDaylineItem(itemId);
    setTodayItems((prev) => prev.filter((i) => i.id !== itemId));
    setPreviousItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const refreshItems = async (): Promise<void> => {
    await loadItems();
  };

  const value: DaylineContextValue = {
    todayItems,
    previousItems,
    isLoading,
    addItem,
    updateItem,
    updateMood,
    deleteItem,
    refreshItems,
  };

  return (
    <DaylineContext.Provider value={value}>{children}</DaylineContext.Provider>
  );
}

export function useDayline(): DaylineContextValue {
  const context = useContext(DaylineContext);
  if (!context) {
    throw new Error('useDayline must be used within a DaylineProvider');
  }
  return context;
}