/**
 * snapshotStore.ts
 * Zustand store for managing daily activity snapshots
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DailySnapshot,
  createEmptySnapshot,
  formatDateKey,
  getWeekDates,
  EnergyMode,
} from '@/src/models/DailySnapshot';

interface SnapshotStore {
  // State
  snapshots: Record<string, DailySnapshot>; // Keyed by date (YYYY-MM-DD)

  // Actions
  loadTodaySnapshot: () => DailySnapshot;
  loadSnapshotForDate: (date: Date) => DailySnapshot;
  getWeekSnapshots: (date: Date) => DailySnapshot[];
  updateSnapshot: (date: Date, updates: Partial<DailySnapshot>) => void;
  incrementTodayCounter: (
    field: 'focusItemsCompleted' | 'routineRunsCompleted' | 'itemsMovedToLater'
  ) => void;
  addFocusTime: (durationMs: number) => void;
  addEnergyMode: (energyMode: EnergyMode) => void;
  updateActivityTimestamp: () => void;
  cleanupOldSnapshots: () => void;
}

const RETENTION_DAYS = 30;

export const useSnapshotStore = create<SnapshotStore>()(
  persist(
    (set, get) => ({
      // Initial state
      snapshots: {},

      // Load today's snapshot
      loadTodaySnapshot: () => {
        const today = new Date();
        return get().loadSnapshotForDate(today);
      },

      // Load snapshot for a specific date
      loadSnapshotForDate: (date: Date) => {
        const dateKey = formatDateKey(date);
        const { snapshots } = get();

        if (snapshots[dateKey]) {
          return snapshots[dateKey];
        }

        return createEmptySnapshot(dateKey);
      },

      // Get snapshots for the week containing the given date
      getWeekSnapshots: (date: Date) => {
        const weekDates = getWeekDates(date);
        const { snapshots } = get();

        return weekDates.map((weekDate) => {
          const dateKey = formatDateKey(weekDate);
          return snapshots[dateKey] || createEmptySnapshot(dateKey);
        });
      },

      // Update a snapshot with partial updates
      updateSnapshot: (date: Date, updates: Partial<DailySnapshot>) => {
        const dateKey = formatDateKey(date);

        set((state) => {
          const existingSnapshot =
            state.snapshots[dateKey] || createEmptySnapshot(dateKey);

          return {
            snapshots: {
              ...state.snapshots,
              [dateKey]: {
                ...existingSnapshot,
                ...updates,
              },
            },
          };
        });
      },

      // Increment a counter for today
      incrementTodayCounter: (field) => {
        const today = new Date();
        const dateKey = formatDateKey(today);
        const now = new Date().toISOString();

        set((state) => {
          const existingSnapshot =
            state.snapshots[dateKey] || createEmptySnapshot(dateKey);

          const updatedSnapshot: DailySnapshot = {
            ...existingSnapshot,
            [field]: existingSnapshot[field] + 1,
            lastActivityAt: now,
          };

          // Set firstActivityAt if not set
          if (!updatedSnapshot.firstActivityAt) {
            updatedSnapshot.firstActivityAt = now;
          }

          return {
            snapshots: {
              ...state.snapshots,
              [dateKey]: updatedSnapshot,
            },
          };
        });
      },

      // Add focus time to today's snapshot
      addFocusTime: (durationMs: number) => {
        const today = new Date();
        const dateKey = formatDateKey(today);
        const now = new Date().toISOString();

        set((state) => {
          const existingSnapshot =
            state.snapshots[dateKey] || createEmptySnapshot(dateKey);

          const updatedSnapshot: DailySnapshot = {
            ...existingSnapshot,
            totalFocusTimeMs: existingSnapshot.totalFocusTimeMs + durationMs,
            lastActivityAt: now,
          };

          if (!updatedSnapshot.firstActivityAt) {
            updatedSnapshot.firstActivityAt = now;
          }

          return {
            snapshots: {
              ...state.snapshots,
              [dateKey]: updatedSnapshot,
            },
          };
        });
      },

      // Add energy mode to today's snapshot (deduped)
      addEnergyMode: (energyMode: EnergyMode) => {
        const today = new Date();
        const dateKey = formatDateKey(today);
        const now = new Date().toISOString();

        set((state) => {
          const existingSnapshot =
            state.snapshots[dateKey] || createEmptySnapshot(dateKey);

          // Only add if not already present
          const energyModesSelected = existingSnapshot.energyModesSelected.includes(
            energyMode
          )
            ? existingSnapshot.energyModesSelected
            : [...existingSnapshot.energyModesSelected, energyMode];

          const updatedSnapshot: DailySnapshot = {
            ...existingSnapshot,
            energyModesSelected,
            lastActivityAt: now,
          };

          if (!updatedSnapshot.firstActivityAt) {
            updatedSnapshot.firstActivityAt = now;
          }

          return {
            snapshots: {
              ...state.snapshots,
              [dateKey]: updatedSnapshot,
            },
          };
        });
      },

      // Update activity timestamp
      updateActivityTimestamp: () => {
        const today = new Date();
        const dateKey = formatDateKey(today);
        const now = new Date().toISOString();

        set((state) => {
          const existingSnapshot =
            state.snapshots[dateKey] || createEmptySnapshot(dateKey);

          const updatedSnapshot: DailySnapshot = {
            ...existingSnapshot,
            lastActivityAt: now,
          };

          if (!updatedSnapshot.firstActivityAt) {
            updatedSnapshot.firstActivityAt = now;
          }

          return {
            snapshots: {
              ...state.snapshots,
              [dateKey]: updatedSnapshot,
            },
          };
        });
      },

      // Cleanup snapshots older than retention period
      cleanupOldSnapshots: () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
        const cutoffDateKey = formatDateKey(cutoffDate);

        set((state) => {
          const filteredSnapshots: Record<string, DailySnapshot> = {};

          Object.entries(state.snapshots).forEach(([dateKey, snapshot]) => {
            if (dateKey >= cutoffDateKey) {
              filteredSnapshots[dateKey] = snapshot;
            }
          });

          return {
            snapshots: filteredSnapshots,
          };
        });
      },
    }),
    {
      name: '@just-today/daily-snapshots',
      version: 1,
    }
  )
);
