/**
 * focusStore.ts
 * Zustand store for managing Today/Later focus items
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FocusItem, FocusDuration, ReminderTiming, TimeBucket, calculateReminderDate } from '@/src/models/FocusItem';
import { useSnapshotStore } from './snapshotStore';
import type { BrainDumpItem } from '@/src/models/BrainDumpItem';
import {
  CompletedTodayEntry,
  createCompletedTaskEntry,
  createCompletedRoutineEntry,
} from '@/src/models/CompletedTodayEntry';

interface FocusStore {
  // State
  todayItems: FocusItem[];
  laterItems: FocusItem[];
  rolloverCount: number;
  lastCheckDate: string; // ISO date string
  completionCelebrationMessage: string | null;

  // Completed Today state - evidence of daily work
  completedToday: CompletedTodayEntry[];
  completedTodayDate: string; // YYYY-MM-DD for day reset

  // Actions
  addToToday: (title: string, duration: FocusDuration, projectId?: string | null) => void;
  addToLater: (title: string, duration: FocusDuration, reminderTiming?: ReminderTiming, customDate?: Date, projectId?: string | null) => void;
  addFromBrainDump: (item: BrainDumpItem, location: 'today' | 'later') => void;
  moveToLater: (itemId: string, reminderTiming?: ReminderTiming, customDate?: Date) => void;
  moveToToday: (itemId: string) => void;
  updateTodayItem: (itemId: string, title: string, duration: FocusDuration, projectId?: string | null) => void;
  updateLaterItem: (itemId: string, title: string, duration: FocusDuration, timeBucket?: TimeBucket, projectId?: string | null) => void;
  setItemProject: (itemId: string, projectId: string | null) => void;
  clearProjectFromItems: (projectId: string) => void;
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

  // Completed Today actions
  undoComplete: (entryId: string) => void;
  addRoutineCompletion: (routineTemplateId: string, routineName: string) => void;
}

const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

      // Completed Today state
      completedToday: [],
      completedTodayDate: getTodayDateString(),

      // Add to Today
      addToToday: (title, duration, projectId) => {
        const item = createFocusItem(title, duration, 'today');
        if (projectId !== undefined) item.projectId = projectId;
        set((state) => ({
          todayItems: [...state.todayItems, item],
        }));
      },

      // Add to Later
      addToLater: (title, duration, reminderTiming, customDate, projectId) => {
        const item = createFocusItem(title, duration, 'later');
        if (projectId !== undefined) item.projectId = projectId;
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

      // Add from Brain Dump (convert to focus item)
      addFromBrainDump: (brainDumpItem, location) => {
        const focusItem = createFocusItem(brainDumpItem.text, '~15 min', location);
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
      updateTodayItem: (itemId, title, duration, projectId) => {
        set((state) => ({
          todayItems: state.todayItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  title,
                  estimatedDuration: duration,
                  projectId: projectId !== undefined ? projectId : item.projectId,
                }
              : item
          ),
        }));
      },

      // Update Later item
      updateLaterItem: (itemId, title, duration, timeBucket, projectId) => {
        set((state) => ({
          laterItems: state.laterItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  title,
                  estimatedDuration: duration,
                  timeBucket,
                  projectId: projectId !== undefined ? projectId : item.projectId,
                }
              : item
          ),
        }));
      },

      // Assign or remove a project from a focus item
      setItemProject: (itemId, projectId) => {
        set((state) => ({
          todayItems: state.todayItems.map((item) =>
            item.id === itemId ? { ...item, projectId } : item
          ),
          laterItems: state.laterItems.map((item) =>
            item.id === itemId ? { ...item, projectId } : item
          ),
        }));
      },

      // Un-assign all items that belonged to a deleted project
      clearProjectFromItems: (projectId) => {
        set((state) => ({
          todayItems: state.todayItems.map((item) =>
            item.projectId === projectId ? { ...item, projectId: null } : item
          ),
          laterItems: state.laterItems.map((item) =>
            item.projectId === projectId ? { ...item, projectId: null } : item
          ),
        }));
      },

      // Complete item
      completeItem: (itemId) => {
        set((state) => {
          // Check if item exists and is being completed (not already completed)
          const todayItem = state.todayItems.find((i) => i.id === itemId);
          const laterItem = state.laterItems.find((i) => i.id === itemId);
          const item = todayItem || laterItem;

          if (!item || item.completedAt) return state;

          // Track in snapshot
          useSnapshotStore.getState().incrementTodayCounter('focusItemsCompleted');

          // Sync weekly intent completions
          setTimeout(() => {
            const { useWeeklyIntentStore } = require('./weeklyIntentStore');
            useWeeklyIntentStore.getState().syncCompletions();
          }, 0);

          // Celebrate if item had rollover count
          if (item.rolloverCount && item.rolloverCount > 0) {
            setTimeout(() => {
              set({ completionCelebrationMessage: "You got there in your own time" });
              setTimeout(() => {
                set({ completionCelebrationMessage: null });
              }, 4000);
            }, 0);
          }

          // Create completed today entry
          const completedEntry = createCompletedTaskEntry(item.id, item.title);

          // Remove from today/later and add to completedToday
          return {
            todayItems: state.todayItems.filter((i) => i.id !== itemId),
            laterItems: state.laterItems.filter((i) => i.id !== itemId),
            completedToday: [...state.completedToday, completedEntry],
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

      // Set circle back date for item
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

      // Clear circle back date for item
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

      // Mark circle back as triggered (called when item becomes due)
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
        const { lastCheckDate, todayItems, completedTodayDate } = get();

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
                // Reset CompletedToday on new day
                completedToday: [],
                completedTodayDate: currentDate,
              };
            });
          } else {
            set({
              lastCheckDate: currentDate,
              // Reset CompletedToday on new day
              completedToday: [],
              completedTodayDate: currentDate,
            });
          }
        }

        // Also check if completedTodayDate is stale (separate from rollover)
        if (completedTodayDate !== currentDate) {
          set({
            completedToday: [],
            completedTodayDate: currentDate,
          });
        }
      },

      // Undo a completed task (restore to Today)
      undoComplete: (entryId) => {
        set((state) => {
          const entry = state.completedToday.find((e) => e.id === entryId);
          if (!entry || entry.type !== 'task' || !entry.sourceItemId) return state;

          // Create a new focus item from the completed entry
          const restoredItem = createFocusItem(entry.title, '~15 min', 'today');

          return {
            completedToday: state.completedToday.filter((e) => e.id !== entryId),
            todayItems: [...state.todayItems, restoredItem],
          };
        });
      },

      // Add routine completion to Completed Today
      addRoutineCompletion: (routineTemplateId, routineName) => {
        const entry = createCompletedRoutineEntry(routineTemplateId, routineName);
        set((state) => ({
          completedToday: [...state.completedToday, entry],
        }));
      },
    }),
    {
      name: 'focus-storage',
    }
  )
);
