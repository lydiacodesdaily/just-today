/**
 * TodayOptionalContext.tsx
 * Manages Today Optional Items - Energy Menu items added to Today.
 * These items are reset daily at midnight.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TodayOptionalItem, EnergyMenuItem } from '../models/EnergyMenuItem';
import {
  loadTodayOptionalItems,
  addOptionalItemToToday,
  removeOptionalItem,
  markOptionalComplete,
  checkAndResetIfNewDay,
} from '../persistence/todayOptionalStore';

interface TodayOptionalContextValue {
  todayItems: TodayOptionalItem[];
  addItemToToday: (menuItem: EnergyMenuItem) => Promise<void>;
  removeItemFromToday: (id: string) => Promise<void>;
  completeItem: (id: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

const TodayOptionalContext = createContext<TodayOptionalContextValue | null>(null);

export function TodayOptionalProvider({ children }: { children: React.ReactNode }) {
  const [todayItems, setTodayItems] = useState<TodayOptionalItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Today Optional Items on mount and check for daily reset
  useEffect(() => {
    loadItems();

    // Set up interval to check for day change every minute
    const interval = setInterval(async () => {
      const wasReset = await checkAndResetIfNewDay();
      if (wasReset) {
        await loadItems();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const loadItems = async () => {
    const items = await loadTodayOptionalItems();
    setTodayItems(items);
    setIsLoaded(true);
  };

  const addItemToToday = useCallback(async (menuItem: EnergyMenuItem) => {
    const newItem = await addOptionalItemToToday(menuItem);
    setTodayItems(prev => [...prev, newItem]);
  }, []);

  const removeItemFromToday = useCallback(async (id: string) => {
    await removeOptionalItem(id);
    setTodayItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const completeItem = useCallback(async (id: string) => {
    await markOptionalComplete(id);
    // Remove completed items from the list
    setTodayItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const refreshItems = useCallback(async () => {
    await loadItems();
  }, []);

  const value: TodayOptionalContextValue = {
    todayItems,
    addItemToToday,
    removeItemFromToday,
    completeItem,
    refreshItems,
  };

  return (
    <TodayOptionalContext.Provider value={value}>
      {children}
    </TodayOptionalContext.Provider>
  );
}

export function useTodayOptional() {
  const context = useContext(TodayOptionalContext);
  if (!context) {
    throw new Error('useTodayOptional must be used within TodayOptionalProvider');
  }
  return context;
}
