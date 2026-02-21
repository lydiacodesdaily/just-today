/**
 * checkInStore.ts
 * Zustand store for managing Check-in items
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CheckInItem, createCheckInItem, getTodayDateKey, isFromToday } from '@/src/models/CheckInItem';
import { Pace } from '@/src/models/RoutineTemplate';

interface CheckInStore {
  // State
  items: CheckInItem[];

  // Actions
  addItem: (text: string, mood?: Pace) => void;
  updateMood: (itemId: string, mood: Pace) => void;
  deleteItem: (itemId: string) => void;

  // Selectors
  getTodayItems: () => CheckInItem[];
  cleanup: () => void; // Drop items older than 30 days
}

export const useCheckInStore = create<CheckInStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (text, mood) => {
        const item = createCheckInItem(text, mood);
        set((state) => ({
          items: [item, ...state.items],
        }));
      },

      updateMood: (itemId, mood) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, mood } : item
          ),
        }));
      },

      deleteItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      getTodayItems: () => {
        return get().items.filter(isFromToday);
      },

      cleanup: () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoff = thirtyDaysAgo.toISOString().split('T')[0];
        set((state) => ({
          items: state.items.filter((item) => item.dateKey >= cutoff),
        }));
      },
    }),
    {
      name: 'checkin-storage',
    }
  )
);
