/**
 * dailyEntryStore.ts
 * Zustand store for the daily first-entry check-in.
 * Once-per-day nervous-system reset entry point.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DailyEntry,
  DailyEmotion,
  createDailyEntry,
  isFromToday,
  getTodayDateKey,
} from '@/src/models/DailyEntry';

interface DailyEntryStore {
  // State
  entries: DailyEntry[];
  dismissedDate: string | null;

  // Actions
  saveEntry: (text: string, emotion?: DailyEmotion) => void;
  dismissForToday: () => void;

  // Selectors
  getTodayEntry: () => DailyEntry | null;
  shouldShowFirstEntry: () => boolean;
}

export const useDailyEntryStore = create<DailyEntryStore>()(
  persist(
    (set, get) => ({
      entries: [],
      dismissedDate: null,

      saveEntry: (text, emotion) => {
        const entry = createDailyEntry(text, emotion);
        set((state) => ({
          entries: [...state.entries, entry],
        }));
      },

      dismissForToday: () => {
        set({ dismissedDate: getTodayDateKey() });
      },

      getTodayEntry: () => {
        return get().entries.find(isFromToday) ?? null;
      },

      shouldShowFirstEntry: () => {
        const { entries, dismissedDate } = get();
        const hasTodayEntry = entries.some(isFromToday);
        if (hasTodayEntry) return false;
        if (dismissedDate === getTodayDateKey()) return false;
        return true;
      },
    }),
    {
      name: 'daily-entry-storage',
    }
  )
);
