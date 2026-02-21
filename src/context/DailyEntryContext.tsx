/**
 * DailyEntryContext.tsx
 * Context for the daily first-entry check-in.
 * Manages loading/saving the once-per-day nervous-system reset entry.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { DailyEntry, DailyEmotion } from '../models/DailyEntry';
import {
  loadTodayEntry,
  saveDailyEntry,
  loadDismissedDate,
  saveDismissedDate,
  shouldShowFirstEntry,
} from '../persistence/dailyEntryStore';
import { getTodayDateKey } from '../models/DailyEntry';

interface DailyEntryContextValue {
  todayEntry: DailyEntry | null;
  dismissedDate: string | null;
  isLoading: boolean;
  saveEntry: (text: string, emotion?: DailyEmotion) => Promise<void>;
  dismissForToday: () => void;
  shouldShow: () => boolean;
}

const DailyEntryContext = createContext<DailyEntryContextValue | undefined>(
  undefined
);

export function DailyEntryProvider({ children }: { children: ReactNode }) {
  const [todayEntry, setTodayEntry] = useState<DailyEntry | null>(null);
  const [dismissedDate, setDismissedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadState = useCallback(async () => {
    try {
      const [entry, dismissed] = await Promise.all([
        loadTodayEntry(),
        loadDismissedDate(),
      ]);
      setTodayEntry(entry);
      setDismissedDate(dismissed);
    } catch (error) {
      console.error('Failed to load daily entry state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const saveEntry = useCallback(
    async (text: string, emotion?: DailyEmotion) => {
      const entry = await saveDailyEntry(text, emotion);
      setTodayEntry(entry);
    },
    []
  );

  const dismissForToday = useCallback(async () => {
    const today = getTodayDateKey();
    await saveDismissedDate(today);
    setDismissedDate(today);
  }, []);

  const shouldShow = useCallback((): boolean => {
    return shouldShowFirstEntry(todayEntry, dismissedDate);
  }, [todayEntry, dismissedDate]);

  const value: DailyEntryContextValue = {
    todayEntry,
    dismissedDate,
    isLoading,
    saveEntry,
    dismissForToday,
    shouldShow,
  };

  return (
    <DailyEntryContext.Provider value={value}>
      {children}
    </DailyEntryContext.Provider>
  );
}

export function useDailyEntry(): DailyEntryContextValue {
  const context = useContext(DailyEntryContext);
  if (!context) {
    throw new Error('useDailyEntry must be used within a DailyEntryProvider');
  }
  return context;
}
