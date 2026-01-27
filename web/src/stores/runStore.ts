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
import { useSnapshotStore } from './snapshotStore';

interface RunStore {
  // State
  currentRun: RoutineRun | null;

  // Actions
  setCurrentRun: (run: RoutineRun | null) => void;
  startCurrentRun: () => void;
  pauseCurrentRun: () => void;
  resumeCurrentRun: () => void;
  endCurrentRun: () => Promise<void>;
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
          const updatedRun = startRun(currentRun);

          // Track pace selection in snapshot
          useSnapshotStore.getState().addPace(updatedRun.pace);

          set({ currentRun: updatedRun });
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
      endCurrentRun: async () => {
        const { currentRun } = get();
        if (currentRun) {
          const updatedRun = endRun(currentRun);

          // Log partial completions when routine is abandoned
          const completedTasksCount = updatedRun.tasks.filter(
            (t) => t.status === 'completed'
          ).length;

          if (completedTasksCount > 0) {
            useSnapshotStore.getState().addCompletedTasks(completedTasksCount);
          }

          set({ currentRun: updatedRun });
        }
      },

      // Advance to next task
      advanceTask: async () => {
        const { currentRun } = get();
        if (currentRun) {
          const previousStatus = currentRun.status;
          const updatedRun = await advanceToNextTask(currentRun);

          // If run just completed, count it in snapshot and add to CompletedToday
          if (previousStatus !== 'completed' && updatedRun.status === 'completed') {
            // Mark source FocusItem or OptionalItem as completed
            if (updatedRun.sourceFocusItemId) {
              const { useFocusStore } = await import('./focusStore');
              useFocusStore.getState().completeItem(updatedRun.sourceFocusItemId);
            }
            if (updatedRun.sourceOptionalItemId) {
              const { usePacePicksStore } = await import('./pacePicksStore');
              usePacePicksStore.getState().completeOptionalItem(updatedRun.sourceOptionalItemId);
            }

            // Count completed tasks (excluding focus items and optional items)
            const completedTasks = updatedRun.tasks.filter(
              (t) => (t.status === 'completed' || t.status === 'skipped') &&
                     !t.name.toLowerCase().includes('focus')
            );

            // Increment counter for each completed non-focus task
            completedTasks.forEach(() => {
              useSnapshotStore.getState().incrementTodayCounter('routineRunsCompleted');
            });

            // Add routine completion to CompletedToday (only for actual routines, not single focus items)
            if (!updatedRun.sourceFocusItemId && !updatedRun.sourceOptionalItemId) {
              const { useFocusStore } = await import('./focusStore');
              useFocusStore.getState().addRoutineCompletion(updatedRun.templateId, updatedRun.templateName);
            }
          }

          set({ currentRun: updatedRun });
        }
      },

      // Skip current task
      skipCurrentTask: async (taskId: string) => {
        const { currentRun } = get();
        if (currentRun) {
          const previousStatus = currentRun.status;
          const updatedRun = await skipTask(currentRun, taskId);

          // If run just completed (by skipping the last task), mark source items as completed
          if (previousStatus !== 'completed' && updatedRun.status === 'completed') {
            if (updatedRun.sourceFocusItemId) {
              const { useFocusStore } = await import('./focusStore');
              useFocusStore.getState().completeItem(updatedRun.sourceFocusItemId);
            }
            if (updatedRun.sourceOptionalItemId) {
              const { usePacePicksStore } = await import('./pacePicksStore');
              usePacePicksStore.getState().completeOptionalItem(updatedRun.sourceOptionalItemId);
            }
          }

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
      name: 'run-storage-v2',
      // Persist currentRun so abandoned runs can be resumed
      partialize: (state) => ({ currentRun: state.currentRun }),
    }
  )
);
