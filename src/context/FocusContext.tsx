/**
 * FocusContext.tsx
 * Context provider for managing Today and Later items
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { FocusItem, FocusDuration, TimeBucket } from '../models/FocusItem';
import {
  loadTodayFocusItems,
  loadLaterItems,
  createTodayFocusItem,
  createLaterItem,
  moveToLater,
  moveToToday,
  markFocusItemComplete,
  deleteFocusItem,
  updateReminderDate,
  updateTimeBucket,
  startFocusSession,
  endFocusSession,
  checkAndRolloverIfNewDay,
  getRolloverCount,
  clearRolloverTracking,
  reorderItems,
  updateFocusItem,
  setCheckOnceDate as persistSetCheckOnce,
} from '../persistence/focusStore';

interface FocusContextValue {
  // State
  todayItems: FocusItem[];
  laterItems: FocusItem[];
  isLoading: boolean;
  rolloverCount: number;

  // Today actions
  addToToday: (title: string, duration: FocusDuration) => Promise<FocusItem>;
  moveItemToLater: (itemId: string, reminderDate?: string) => Promise<void>;
  completeItem: (itemId: string) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;

  // Later actions
  addToLater: (title: string, duration: FocusDuration, reminderDate?: string) => Promise<FocusItem>;
  moveItemToToday: (itemId: string) => Promise<void>;
  setItemReminder: (itemId: string, reminderDate?: string) => Promise<void>;
  setItemTimeBucket: (itemId: string, timeBucket?: TimeBucket) => Promise<void>;

  // Focus session tracking
  startItemFocus: (itemId: string) => Promise<void>;
  endItemFocus: (itemId: string) => Promise<void>;

  // Reordering
  reorderTodayItems: (reorderedItems: FocusItem[]) => Promise<void>;
  reorderLaterItems: (reorderedItems: FocusItem[]) => Promise<void>;

  // Circle Back feature
  setCheckOnce: (itemId: string, checkOnceDate: string) => Promise<void>;

  // Edit items
  updateTodayItem: (itemId: string, title: string, duration: FocusDuration) => Promise<void>;
  updateLaterItem: (itemId: string, title: string, duration: FocusDuration, timeBucket?: TimeBucket) => Promise<void>;

  // Cross-list transfer from Brain Dump
  addFromBrainDump: (text: string, location: 'today' | 'later') => Promise<FocusItem>;

  // Utility
  refreshItems: () => Promise<void>;
  dismissRolloverMessage: () => Promise<void>;
}

const FocusContext = createContext<FocusContextValue | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
  const [todayItems, setTodayItems] = useState<FocusItem[]>([]);
  const [laterItems, setLaterItems] = useState<FocusItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rolloverCount, setRolloverCount] = useState<number>(0);

  // Load items on mount and check for rollovers
  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check for daily rollover first
      await checkAndRolloverIfNewDay();

      // Load items
      const [today, later, rollover] = await Promise.all([
        loadTodayFocusItems(),
        loadLaterItems(),
        getRolloverCount(),
      ]);

      setTodayItems(today);
      setLaterItems(later);
      setRolloverCount(rollover);
    } catch (error) {
      console.error('Failed to load focus items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for rollover periodically (every minute)
  useEffect(() => {
    const interval = setInterval(async () => {
      await checkAndRolloverIfNewDay();
      const rollover = await getRolloverCount();
      if (rollover > 0) {
        await loadItems();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Today actions
  const addToToday = useCallback(async (title: string, duration: FocusDuration): Promise<FocusItem> => {
    const newItem = await createTodayFocusItem(title, duration);
    setTodayItems((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const moveItemToLater = useCallback(async (itemId: string, reminderDate?: string): Promise<void> => {
    await moveToLater(itemId, reminderDate);
    setTodayItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (item) {
        setLaterItems((laterPrev) => [
          ...laterPrev,
          { ...item, location: 'later', movedToLaterAt: new Date().toISOString(), reminderDate },
        ]);
      }
      return prev.filter((i) => i.id !== itemId);
    });
  }, []);

  const completeItem = useCallback(async (itemId: string): Promise<void> => {
    await markFocusItemComplete(itemId);
    setTodayItems((prev) => prev.filter((i) => i.id !== itemId));
    setLaterItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const deleteItem = useCallback(async (itemId: string): Promise<void> => {
    await deleteFocusItem(itemId);
    setTodayItems((prev) => prev.filter((i) => i.id !== itemId));
    setLaterItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  // Later actions
  const addToLater = useCallback(async (
    title: string,
    duration: FocusDuration,
    reminderDate?: string
  ): Promise<FocusItem> => {
    const newItem = await createLaterItem(title, duration, reminderDate);
    setLaterItems((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const moveItemToToday = useCallback(async (itemId: string): Promise<void> => {
    await moveToToday(itemId);
    setLaterItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (item) {
        setTodayItems((todayPrev) => [...todayPrev, { ...item, location: 'today', addedToTodayAt: new Date().toISOString() }]);
      }
      return prev.filter((i) => i.id !== itemId);
    });
  }, []);

  const setItemReminder = useCallback(async (itemId: string, reminderDate?: string): Promise<void> => {
    await updateReminderDate(itemId, reminderDate);
    setLaterItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, reminderDate } : item))
    );
  }, []);

  const setItemTimeBucket = useCallback(async (itemId: string, timeBucket?: TimeBucket): Promise<void> => {
    await updateTimeBucket(itemId, timeBucket);
    setLaterItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, timeBucket } : item))
    );
  }, []);

  // Focus session tracking
  const startItemFocus = useCallback(async (itemId: string): Promise<void> => {
    await startFocusSession(itemId);
  }, []);

  const endItemFocus = useCallback(async (itemId: string): Promise<void> => {
    await endFocusSession(itemId);
  }, []);

  // Utility
  const refreshItems = useCallback(async (): Promise<void> => {
    await loadItems();
  }, [loadItems]);

  const dismissRolloverMessage = useCallback(async (): Promise<void> => {
    await clearRolloverTracking();
    setRolloverCount(0);
  }, []);

  // Reordering functions
  const reorderTodayItems = useCallback(async (reorderedItems: FocusItem[]): Promise<void> => {
    // Update local state immediately for smooth UX
    setTodayItems(reorderedItems);
    // Persist to storage
    await reorderItems(reorderedItems, 'today');
  }, []);

  const reorderLaterItems = useCallback(async (reorderedItems: FocusItem[]): Promise<void> => {
    // Update local state immediately for smooth UX
    setLaterItems(reorderedItems);
    // Persist to storage
    await reorderItems(reorderedItems, 'later');
  }, []);

  // Circle Back feature
  const setCheckOnce = useCallback(async (itemId: string, checkOnceDate: string): Promise<void> => {
    await persistSetCheckOnce(itemId, checkOnceDate);
    // Update local state
    setTodayItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checkOnceDate } : item))
    );
    setLaterItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checkOnceDate } : item))
    );
  }, []);

  // Edit Today item
  const updateTodayItemFn = useCallback(async (
    itemId: string,
    title: string,
    duration: FocusDuration
  ): Promise<void> => {
    await updateFocusItem(itemId, { title, estimatedDuration: duration });
    setTodayItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, title, estimatedDuration: duration }
          : item
      )
    );
  }, []);

  // Edit Later item
  const updateLaterItemFn = useCallback(async (
    itemId: string,
    title: string,
    duration: FocusDuration,
    timeBucket?: TimeBucket
  ): Promise<void> => {
    await updateFocusItem(itemId, { title, estimatedDuration: duration, timeBucket });
    setLaterItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, title, estimatedDuration: duration, timeBucket }
          : item
      )
    );
  }, []);

  // Cross-list transfer from Brain Dump
  const addFromBrainDump = useCallback(async (
    text: string,
    location: 'today' | 'later'
  ): Promise<FocusItem> => {
    // Default duration for brain dump items
    const defaultDuration: FocusDuration = '~15 min';

    if (location === 'today') {
      return addToToday(text, defaultDuration);
    } else {
      return addToLater(text, defaultDuration);
    }
  }, [addToToday, addToLater]);

  const value: FocusContextValue = useMemo(
    () => ({
      todayItems,
      laterItems,
      isLoading,
      rolloverCount,
      addToToday,
      moveItemToLater,
      completeItem,
      deleteItem,
      addToLater,
      moveItemToToday,
      setItemReminder,
      setItemTimeBucket,
      startItemFocus,
      endItemFocus,
      refreshItems,
      dismissRolloverMessage,
      reorderTodayItems,
      reorderLaterItems,
      setCheckOnce,
      updateTodayItem: updateTodayItemFn,
      updateLaterItem: updateLaterItemFn,
      addFromBrainDump,
    }),
    [
      todayItems,
      laterItems,
      isLoading,
      rolloverCount,
      addToToday,
      moveItemToLater,
      completeItem,
      deleteItem,
      addToLater,
      moveItemToToday,
      setItemReminder,
      setItemTimeBucket,
      startItemFocus,
      endItemFocus,
      refreshItems,
      dismissRolloverMessage,
      reorderTodayItems,
      reorderLaterItems,
      setCheckOnce,
      updateTodayItemFn,
      updateLaterItemFn,
      addFromBrainDump,
    ]
  );

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocus(): FocusContextValue {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}
