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
  getItemCountByLevel: (level: 'low' | 'steady' | 'flow') => number;
  canAddMoreItems: (level: 'low' | 'steady' | 'flow') => boolean;
}

const TodayOptionalContext = createContext<TodayOptionalContextValue | null>(null);

const MAX_ITEMS_BY_LEVEL = {
  low: 1,
  steady: 2,
  flow: 3,
};

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

  // Helper: Get count of incomplete items for a given energy level
  // We track which menu items were added based on their original energy level
  const getItemCountByLevel = useCallback((level: 'low' | 'steady' | 'flow'): number => {
    // Note: We don't store energyLevel on TodayOptionalItem
    // For V1, we'll count total items regardless of level
    // This is a simplification - in a full implementation, we'd need to join with menu items
    return todayItems.filter(item => !item.completedAt).length;
  }, [todayItems]);

  const canAddMoreItems = useCallback((level: 'low' | 'steady' | 'flow'): boolean => {
    const currentCount = todayItems.filter(item => !item.completedAt).length;
    const maxAllowed = MAX_ITEMS_BY_LEVEL[level];
    return currentCount < maxAllowed;
  }, [todayItems]);

  const value: TodayOptionalContextValue = {
    todayItems,
    addItemToToday,
    removeItemFromToday,
    completeItem,
    refreshItems,
    getItemCountByLevel,
    canAddMoreItems,
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
