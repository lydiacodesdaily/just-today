/**
 * runStore.ts
 * Zustand store for managing active routine runs
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoutineRun } from '@/src/models/RoutineRun';
import {
  startRun,
  pauseRun,
  resumeRun,
  endRun,
  advanceToNextTask,
  skipTask,
  extendTask,
  moveTask,
  addQuickTask,
  toggleSubtask,
  toggleAutoAdvance,
} from '@/src/engine/runEngine';

interface RunStore {
  // State
  currentRun: RoutineRun | null;

  // Actions
  setCurrentRun: (run: RoutineRun | null) => void;
  startCurrentRun: () => void;
  pauseCurrentRun: () => void;
  resumeCurrentRun: () => void;
  endCurrentRun: () => void;
  advanceTask: () => Promise<void>;
  skipCurrentTask: (taskId: string) => Promise<void>;
  extendCurrentTask: (taskId: string, deltaMs: number) => void;
  moveCurrentTask: (
    taskId: string,
    position: 'up' | 'down' | 'next' | 'end' | number
  ) => void;
  addQuickTaskToRun: (name: string, durationMs: number) => void;
  toggleTaskSubtask: (taskId: string, subtaskId: string) => void;
  toggleTaskAutoAdvance: (taskId: string) => void;
}

export const useRunStore = create<RunStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentRun: null,

      // Set current run
      setCurrentRun: (run) => {
        set({ currentRun: run });
      },

      // Start the current run
      startCurrentRun: () => {
        const { currentRun } = get();
        if (currentRun) {
          console.log('[runStore] Starting run:', currentRun.id, 'current status:', currentRun.status);
          set({ currentRun: startRun(currentRun) });
        }
      },

      // Pause the current run
      pauseCurrentRun: () => {
        const { currentRun } = get();
        if (currentRun) {
          set({ currentRun: pauseRun(currentRun) });
        }
      },

      // Resume the current run
      resumeCurrentRun: () => {
        const { currentRun } = get();
        if (currentRun) {
          set({ currentRun: resumeRun(currentRun) });
        }
      },

      // End the current run
      endCurrentRun: () => {
        const { currentRun } = get();
        if (currentRun) {
          set({ currentRun: endRun(currentRun) });
        }
      },

      // Advance to next task
      advanceTask: async () => {
        const { currentRun } = get();
        if (currentRun) {
          const updatedRun = await advanceToNextTask(currentRun);
          set({ currentRun: updatedRun });
        }
      },

      // Skip current task
      skipCurrentTask: async (taskId: string) => {
        const { currentRun } = get();
        if (currentRun) {
          const updatedRun = await skipTask(currentRun, taskId);
          set({ currentRun: updatedRun });
        }
      },

      // Extend current task
      extendCurrentTask: (taskId: string, deltaMs: number) => {
        const { currentRun } = get();
        if (currentRun) {
          set({ currentRun: extendTask(currentRun, taskId, deltaMs) });
        }
      },

      // Move task in queue
      moveCurrentTask: (
        taskId: string,
        position: 'up' | 'down' | 'next' | 'end' | number
      ) => {
        const { currentRun } = get();
        if (currentRun) {
          set({ currentRun: moveTask(currentRun, taskId, position) });
        }
      },

      // Add quick task to run
      addQuickTaskToRun: (name: string, durationMs: number) => {
        const { currentRun } = get();
        if (currentRun) {
          set({ currentRun: addQuickTask(currentRun, name, durationMs) });
        }
      },

      // Toggle task subtask
      toggleTaskSubtask: (taskId: string, subtaskId: string) => {
        const { currentRun } = get();
        if (currentRun) {
          set({ currentRun: toggleSubtask(currentRun, taskId, subtaskId) });
        }
      },

      // Toggle auto-advance for task
      toggleTaskAutoAdvance: (taskId: string) => {
        const { currentRun } = get();
        if (currentRun) {
          set({ currentRun: toggleAutoAdvance(currentRun, taskId) });
        }
      },
    }),
    {
      name: 'run-storage-v2', // Changed to clear old persisted data
      // Don't persist runs - they should be ephemeral per session
      partialize: () => ({}),
    }
  )
);
