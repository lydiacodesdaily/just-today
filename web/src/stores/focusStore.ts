/**
 * focusStore.ts
 * Zustand store for managing Today/Later focus items
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FocusItem, FocusDuration, ReminderTiming, TimeBucket, calculateReminderDate } from '@/src/models/FocusItem';
import { useSnapshotStore } from './snapshotStore';
import type { BrainDumpItem } from '@/src/models/BrainDumpItem';
import { brainDumpToFocusItem } from '@/src/lib/dnd/conversions';

interface FocusStore {
  // State
  todayItems: FocusItem[];
  laterItems: FocusItem[];
  rolloverCount: number;
  lastCheckDate: string; // ISO date string
  completionCelebrationMessage: string | null;

  // Actions
  addToToday: (title: string, duration: FocusDuration) => void;
  addToLater: (title: string, duration: FocusDuration, reminderTiming?: ReminderTiming, customDate?: Date) => void;
  addFromBrainDump: (item: BrainDumpItem, location: 'today' | 'later') => void;
  moveToLater: (itemId: string, reminderTiming?: ReminderTiming, customDate?: Date) => void;
  moveToToday: (itemId: string) => void;
  updateTodayItem: (itemId: string, title: string, duration: FocusDuration) => void;
  updateLaterItem: (itemId: string, title: string, duration: FocusDuration, timeBucket?: TimeBucket) => void;
  completeItem: (itemId: string) => void;
  deleteItem: (itemId: string) => void;
  setItemReminder: (itemId: string, reminderTiming?: ReminderTiming, customDate?: Date) => void;
  setItemTimeBucket: (itemId: string, timeBucket?: TimeBucket) => void;
  setCheckOnce: (itemId: string, checkOnceDate: string) => void;
  clearCheckOnce: (itemId: string) => void;
  triggerCheckOnce: (itemId: string) => void;
  startFocus: (itemId: string) => void;
  endFocus: (itemId: string) => void;
  dismissRollover: () => void;
  checkAndRollover: () => void;
  reorderTodayItems: (activeId: string, overId: string) => void;
  reorderLaterItems: (activeId: string, overId: string) => void;
}

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const createFocusItem = (
  title: string,
  duration: FocusDuration,
  location: 'today' | 'later'
): FocusItem => {
  const now = new Date().toISOString();
  const randomId = Math.random().toString(36).substr(2, 9);

  return {
    id: `focus-${Date.now()}-${randomId}`,
    title,
    estimatedDuration: duration,
    location,
    createdAt: now,
    ...(location === 'today' && { addedToTodayAt: now }),
  };
};

export const useFocusStore = create<FocusStore>()(
  persist(
    (set, get) => ({
      // Initial state
      todayItems: [],
      laterItems: [],
      rolloverCount: 0,
      lastCheckDate: getTodayDateString(),
      completionCelebrationMessage: null,

      // Add to Today
      addToToday: (title, duration) => {
        const item = createFocusItem(title, duration, 'today');
        set((state) => ({
          todayItems: [...state.todayItems, item],
        }));
      },

      // Add to Later
      addToLater: (title, duration, reminderTiming, customDate) => {
        const item = createFocusItem(title, duration, 'later');
        const now = new Date().toISOString();

        if (reminderTiming) {
          const reminderDate = calculateReminderDate(reminderTiming, customDate);
          item.reminderDate = reminderDate?.toISOString();
          item.reminderTiming = reminderTiming;
        }

        item.movedToLaterAt = now;

        set((state) => ({
          laterItems: [...state.laterItems, item],
        }));
      },

      // Add from Brain Dump (drag-drop conversion)
      addFromBrainDump: (brainDumpItem, location) => {
        const focusItem = brainDumpToFocusItem(brainDumpItem, location);
        set((state) => ({
          todayItems: location === 'today' ? [...state.todayItems, focusItem] : state.todayItems,
          laterItems: location === 'later' ? [...state.laterItems, focusItem] : state.laterItems,
        }));
      },

      // Move item to Later
      moveToLater: (itemId, reminderTiming, customDate) => {
        const now = new Date().toISOString();

        set((state) => {
          const item = state.todayItems.find((i) => i.id === itemId);
          if (!item) return state;

          const updatedItem: FocusItem = {
            ...item,
            location: 'later',
            movedToLaterAt: now,
          };

          if (reminderTiming) {
            const reminderDate = calculateReminderDate(reminderTiming, customDate);
            updatedItem.reminderDate = reminderDate?.toISOString();
            updatedItem.reminderTiming = reminderTiming;
          }

          // Track in snapshot: item moved to later
          useSnapshotStore.getState().incrementTodayCounter('itemsMovedToLater');

          return {
            todayItems: state.todayItems.filter((i) => i.id !== itemId),
            laterItems: [...state.laterItems, updatedItem],
          };
        });
      },

      // Move item to Today
      moveToToday: (itemId) => {
        const now = new Date().toISOString();

        set((state) => {
          const item = state.laterItems.find((i) => i.id === itemId);
          if (!item) return state;

          const updatedItem: FocusItem = {
            ...item,
            location: 'today',
            addedToTodayAt: now,
            reminderDate: undefined,
            reminderTiming: undefined,
          };

          return {
            laterItems: state.laterItems.filter((i) => i.id !== itemId),
            todayItems: [...state.todayItems, updatedItem],
          };
        });
      },

      // Update Today item
      updateTodayItem: (itemId, title, duration) => {
        set((state) => ({
          todayItems: state.todayItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  title,
                  estimatedDuration: duration,
                }
              : item
          ),
        }));
      },

      // Update Later item
      updateLaterItem: (itemId, title, duration, timeBucket) => {
        set((state) => ({
          laterItems: state.laterItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  title,
                  estimatedDuration: duration,
                  timeBucket,
                }
              : item
          ),
        }));
      },

      // Complete item
      completeItem: (itemId) => {
        const now = new Date().toISOString();

        set((state) => {
          // Check if item exists and is being completed (not already completed)
          const todayItem = state.todayItems.find((i) => i.id === itemId);
          const laterItem = state.laterItems.find((i) => i.id === itemId);
          const item = todayItem || laterItem;

          // Only increment snapshot if item exists and wasn't already completed
          if (item && !item.completedAt) {
            useSnapshotStore.getState().incrementTodayCounter('focusItemsCompleted');

            // Celebrate if item had rollover count
            if (item.rolloverCount && item.rolloverCount > 0) {
              set({ completionCelebrationMessage: "You got there in your own time ✓" });
              // Clear message after 4 seconds
              setTimeout(() => {
                set({ completionCelebrationMessage: null });
              }, 4000);
            }
          }

          return {
            todayItems: state.todayItems.map((item) =>
              item.id === itemId ? { ...item, completedAt: now } : item
            ),
            laterItems: state.laterItems.map((item) =>
              item.id === itemId ? { ...item, completedAt: now } : item
            ),
          };
        });
      },

      // Delete item
      deleteItem: (itemId) => {
        set((state) => ({
          todayItems: state.todayItems.filter((i) => i.id !== itemId),
          laterItems: state.laterItems.filter((i) => i.id !== itemId),
        }));
      },

      // Set reminder for Later item
      setItemReminder: (itemId, reminderTiming, customDate) => {
        set((state) => {
          const reminderDate = reminderTiming ? calculateReminderDate(reminderTiming, customDate) : null;

          return {
            laterItems: state.laterItems.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    reminderDate: reminderDate?.toISOString(),
                    reminderTiming,
                  }
                : item
            ),
          };
        });
      },

      // Set time bucket for Later item
      setItemTimeBucket: (itemId, timeBucket) => {
        set((state) => ({
          laterItems: state.laterItems.map((item) =>
            item.id === itemId ? { ...item, timeBucket } : item
          ),
        }));
      },

      // Set check once date for item
      setCheckOnce: (itemId, checkOnceDate) => {
        set((state) => ({
          todayItems: state.todayItems.map((item) =>
            item.id === itemId
              ? { ...item, checkOnceDate, checkOnceTriggeredAt: undefined }
              : item
          ),
          laterItems: state.laterItems.map((item) =>
            item.id === itemId
              ? { ...item, checkOnceDate, checkOnceTriggeredAt: undefined }
              : item
          ),
        }));
      },

      // Clear check once date for item
      clearCheckOnce: (itemId) => {
        set((state) => ({
          todayItems: state.todayItems.map((item) =>
            item.id === itemId
              ? { ...item, checkOnceDate: undefined, checkOnceTriggeredAt: undefined }
              : item
          ),
          laterItems: state.laterItems.map((item) =>
            item.id === itemId
              ? { ...item, checkOnceDate: undefined, checkOnceTriggeredAt: undefined }
              : item
          ),
        }));
      },

      // Mark check once as triggered (called when item becomes due)
      triggerCheckOnce: (itemId) => {
        const now = new Date().toISOString();
        set((state) => ({
          laterItems: state.laterItems.map((item) =>
            item.id === itemId && item.checkOnceDate && !item.checkOnceTriggeredAt
              ? { ...item, checkOnceTriggeredAt: now }
              : item
          ),
        }));
      },

      // Start focus session
      startFocus: (itemId) => {
        const now = new Date().toISOString();

        set((state) => ({
          todayItems: state.todayItems.map((item) =>
            item.id === itemId ? { ...item, focusStartedAt: now } : item
          ),
          laterItems: state.laterItems.map((item) =>
            item.id === itemId ? { ...item, focusStartedAt: now } : item
          ),
        }));
      },

      // End focus session
      endFocus: (itemId) => {
        const now = new Date().toISOString();

        set((state) => {
          // Find the item and calculate focus duration
          const todayItem = state.todayItems.find((i) => i.id === itemId);
          const laterItem = state.laterItems.find((i) => i.id === itemId);
          const item = todayItem || laterItem;

          if (item && item.focusStartedAt) {
            const startTime = new Date(item.focusStartedAt).getTime();
            const endTime = new Date(now).getTime();
            const durationMs = endTime - startTime;

            // Track focus time in snapshot
            if (durationMs > 0) {
              useSnapshotStore.getState().addFocusTime(durationMs);
            }
          }

          return {
            todayItems: state.todayItems.map((item) =>
              item.id === itemId ? { ...item, focusEndedAt: now } : item
            ),
            laterItems: state.laterItems.map((item) =>
              item.id === itemId ? { ...item, focusEndedAt: now } : item
            ),
          };
        });
      },

      // Dismiss rollover notification
      dismissRollover: () => {
        set({ rolloverCount: 0 });
      },

      // Check for new day and rollover items
      checkAndRollover: () => {
        const currentDate = getTodayDateString();
        const { lastCheckDate, todayItems } = get();

        if (currentDate !== lastCheckDate) {
          // New day detected - rollover incomplete items to Later
          const now = new Date().toISOString();
          const incompleteItems = todayItems.filter((item) => !item.completedAt);

          if (incompleteItems.length > 0) {
            set((state) => {
              const rolledItems = incompleteItems.map((item) => ({
                ...item,
                location: 'later' as const,
                movedToLaterAt: now,
                rolledOverFromDate: lastCheckDate,
                rolloverCount: (item.rolloverCount || 0) + 1,
              }));

              return {
                todayItems: state.todayItems.filter((item) => item.completedAt),
                laterItems: [...state.laterItems, ...rolledItems],
                rolloverCount: incompleteItems.length,
                lastCheckDate: currentDate,
              };
            });
          } else {
            set({ lastCheckDate: currentDate });
          }
        }
      },

      // Reorder items within Today section
      reorderTodayItems: (activeId, overId) => {
        set((state) => {
          const oldIndex = state.todayItems.findIndex((item) => item.id === activeId);
          const newIndex = state.todayItems.findIndex((item) => item.id === overId);

          if (oldIndex === -1 || newIndex === -1) return state;

          const newItems = [...state.todayItems];
          const [movedItem] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, movedItem);

          // Update order property for all items
          const orderedItems = newItems.map((item, index) => ({
            ...item,
            order: index,
          }));

          return { todayItems: orderedItems };
        });
      },

      // Reorder items within Later section
      reorderLaterItems: (activeId, overId) => {
        set((state) => {
          const oldIndex = state.laterItems.findIndex((item) => item.id === activeId);
          const newIndex = state.laterItems.findIndex((item) => item.id === overId);

          if (oldIndex === -1 || newIndex === -1) return state;

          const newItems = [...state.laterItems];
          const [movedItem] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, movedItem);

          // Update order property for all items
          const orderedItems = newItems.map((item, index) => ({
            ...item,
            order: index,
          }));

          return { laterItems: orderedItems };
        });
      },
    }),
    {
      name: 'focus-storage',
    }
  )
);
