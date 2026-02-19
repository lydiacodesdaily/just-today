/**
 * CheckInContext.tsx
 * Context provider for managing Check-in items - one-line captures throughout the day
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
import { CheckInItem } from '../models/CheckInItem';
import {
  loadTodayCheckInItems,
  loadPreviousCheckInItems,
  addCheckInItem,
  updateCheckInItem,
  updateCheckInItemMood,
  deleteCheckInItem,
  cleanupOldCheckInItems,
} from '../persistence/checkInStore';

interface CheckInContextValue {
  // State
  todayItems: CheckInItem[];
  previousItems: CheckInItem[];
  isLoading: boolean;

  // Actions
  addItem: (text: string, mood?: Pace) => Promise<CheckInItem>;
  updateItem: (itemId: string, newText: string) => Promise<void>;
  updateMood: (itemId: string, mood: Pace | undefined) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

const CheckInContext = createContext<CheckInContextValue | undefined>(
  undefined
);

export function CheckInProvider({ children }: { children: ReactNode }) {
  const [todayItems, setTodayItems] = useState<CheckInItem[]>([]);
  const [previousItems, setPreviousItems] = useState<CheckInItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load items on mount
  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const [today, previous] = await Promise.all([
        loadTodayCheckInItems(),
        loadPreviousCheckInItems(),
      ]);
      setTodayItems(today);
      setPreviousItems(previous);
    } catch (error) {
      console.error('Failed to load check-in items:', error);
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
      await cleanupOldCheckInItems();
      await loadItems();
    }, 3600000); // Check every hour

    return () => clearInterval(interval);
  }, [loadItems]);

  // Actions
  const addItem = async (text: string, mood?: Pace): Promise<CheckInItem> => {
    const newItem = await addCheckInItem(text, mood);
    setTodayItems((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateItem = async (
    itemId: string,
    newText: string
  ): Promise<void> => {
    await updateCheckInItem(itemId, newText);
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
    await updateCheckInItemMood(itemId, mood);
    setTodayItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, mood } : item))
    );
    setPreviousItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, mood } : item))
    );
  };

  const deleteItem = async (itemId: string): Promise<void> => {
    await deleteCheckInItem(itemId);
    setTodayItems((prev) => prev.filter((i) => i.id !== itemId));
    setPreviousItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const refreshItems = async (): Promise<void> => {
    await loadItems();
  };

  const value: CheckInContextValue = {
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
    <CheckInContext.Provider value={value}>{children}</CheckInContext.Provider>
  );
}

export function useCheckIn(): CheckInContextValue {
  const context = useContext(CheckInContext);
  if (!context) {
    throw new Error('useCheckIn must be used within a CheckInProvider');
  }
  return context;
}
