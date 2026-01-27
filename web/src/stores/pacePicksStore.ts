/**
 * pacePicksStore.ts
 * Zustand store for managing Pace Pick items and Today Optional items
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PacePickItem, TodayOptionalItem, PaceTag } from '@/src/models/PacePick';

interface PacePicksStore {
  // State
  menuItems: PacePickItem[];
  todayOptionalItems: TodayOptionalItem[];
  todayDate: string; // YYYY-MM-DD

  // Actions
  addMenuItem: (title: string, paceTag: PaceTag, duration?: string) => void;
  updateMenuItem: (id: string, updates: Partial<PacePickItem>) => void;
  deleteMenuItem: (id: string) => void;
  addToToday: (menuItem: PacePickItem) => void;
  removeFromToday: (id: string) => void;
  completeOptionalItem: (id: string) => void;
  checkAndResetDaily: () => void;
}

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const usePacePicksStore = create<PacePicksStore>()(
  persist(
    (set, get) => ({
      // Initial state
      menuItems: [],
      todayOptionalItems: [],
      todayDate: getTodayDateString(),

      // Add menu item
      addMenuItem: (title, paceTag, duration) => {
        const now = Date.now();
        const id = `menu-${now}-${Math.random().toString(36).substr(2, 9)}`;

        const item: PacePickItem = {
          id,
          title,
          paceTag,
          estimatedDuration: duration as any,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          menuItems: [...state.menuItems, item],
        }));
      },

      // Update menu item
      updateMenuItem: (id, updates) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item
          ),
        }));
      },

      // Delete menu item
      deleteMenuItem: (id) => {
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
        }));
      },

      // Add menu item to Today
      addToToday: (menuItem) => {
        const now = Date.now();
        const id = `today-opt-${now}-${Math.random().toString(36).substr(2, 9)}`;

        const todayItem: TodayOptionalItem = {
          id,
          menuItemId: menuItem.id,
          title: menuItem.title,
          estimatedDuration: menuItem.estimatedDuration,
          addedAt: now,
        };

        set((state) => ({
          todayOptionalItems: [...state.todayOptionalItems, todayItem],
        }));
      },

      // Remove from Today
      removeFromToday: (id) => {
        set((state) => ({
          todayOptionalItems: state.todayOptionalItems.filter((item) => item.id !== id),
        }));
      },

      // Complete optional item
      completeOptionalItem: (id) => {
        const now = Date.now();
        set((state) => ({
          todayOptionalItems: state.todayOptionalItems.map((item) =>
            item.id === id ? { ...item, completedAt: now } : item
          ),
        }));
      },

      // Check and reset for new day
      checkAndResetDaily: () => {
        const currentDate = getTodayDateString();
        const { todayDate } = get();

        if (currentDate !== todayDate) {
          // New day - clear optional items
          set({
            todayOptionalItems: [],
            todayDate: currentDate,
          });
        }
      },
    }),
    {
      name: 'pace-picks-storage',
    }
  )
);

// Backwards compatibility alias
export const useEnergyMenuStore = usePacePicksStore;
