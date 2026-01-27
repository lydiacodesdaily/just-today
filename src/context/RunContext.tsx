/**
 * RunContext.tsx
 * Active routine run state management.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { RoutineRun } from '../models/RoutineRun';
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
} from '../engine/runEngine';
import { saveRunState, loadRunState, clearRunState } from '../persistence/runStateStore';
import { incrementTodayCounter, addPace, addCompletedTasks } from '../persistence/snapshotStore';

interface RunContextValue {
  currentRun: RoutineRun | null;
  setCurrentRun: (run: RoutineRun | null) => void;
  startCurrentRun: () => void;
  pauseCurrentRun: () => void;
  resumeCurrentRun: () => void;
  endCurrentRun: () => void;
  advanceTask: () => void;
  skipCurrentTask: (taskId: string) => void;
  extendCurrentTask: (taskId: string, deltaMs: number) => void;
  moveCurrentTask: (
    taskId: string,
    position: 'up' | 'down' | 'next' | 'end' | number
  ) => void;
  addQuickTaskToRun: (name: string, durationMs: number) => void;
  toggleTaskSubtask: (taskId: string, subtaskId: string) => void;
  toggleTaskAutoAdvance: (taskId: string) => void;
}

const RunContext = createContext<RunContextValue | null>(null);

export function RunProvider({ children }: { children: React.ReactNode }) {
  const [currentRun, setCurrentRun] = useState<RoutineRun | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved run state on mount
  useEffect(() => {
    loadRunState().then((savedRun) => {
      if (savedRun) {
        setCurrentRun(savedRun);
      }
      setIsLoaded(true);
    });
  }, []);

  // Auto-save run state whenever it changes
  useEffect(() => {
    if (!isLoaded) return; // Don't save during initial load

    if (currentRun) {
      saveRunState(currentRun);

      // Track pace when run starts
      if (currentRun.status === 'running' && currentRun.startedAt) {
        addPace(currentRun.pace);
      }

      // Track completion when run is completed
      if (currentRun.status === 'completed' && currentRun.endedAt) {
        // Only increment routineRunsCompleted for actual routines, not focus items
        const isFocusItem = currentRun.templateId === 'focus-item' || currentRun.templateId === 'optional-item';
        if (!isFocusItem) {
          incrementTodayCounter('routineRunsCompleted');
        }
      }
    } else {
      clearRunState();
    }
  }, [currentRun, isLoaded]);

  const startCurrentRun = useCallback(() => {
    if (currentRun) {
      setCurrentRun(startRun(currentRun));
    }
  }, [currentRun]);

  const pauseCurrentRun = useCallback(() => {
    if (currentRun) {
      setCurrentRun(pauseRun(currentRun));
    }
  }, [currentRun]);

  const resumeCurrentRun = useCallback(() => {
    if (currentRun) {
      setCurrentRun(resumeRun(currentRun));
    }
  }, [currentRun]);

  const endCurrentRun = useCallback(() => {
    if (currentRun) {
      const updatedRun = endRun(currentRun);

      // Log partial completions when routine is abandoned
      const completedTasksCount = updatedRun.tasks.filter(
        (t) => t.status === 'completed'
      ).length;

      if (completedTasksCount > 0) {
        addCompletedTasks(completedTasksCount);
      }

      setCurrentRun(updatedRun);
    }
  }, [currentRun]);

  const advanceTask = useCallback(async () => {
    if (currentRun) {
      const updatedRun = await advanceToNextTask(currentRun);
      setCurrentRun(updatedRun);
    }
  }, [currentRun]);

  const skipCurrentTask = useCallback(
    async (taskId: string) => {
      if (currentRun) {
        const updatedRun = await skipTask(currentRun, taskId);
        setCurrentRun(updatedRun);
      }
    },
    [currentRun]
  );

  const extendCurrentTask = useCallback(
    (taskId: string, deltaMs: number) => {
      if (currentRun) {
        setCurrentRun(extendTask(currentRun, taskId, deltaMs));
      }
    },
    [currentRun]
  );

  const moveCurrentTask = useCallback(
    (taskId: string, position: 'up' | 'down' | 'next' | 'end' | number) => {
      if (currentRun) {
        setCurrentRun(moveTask(currentRun, taskId, position));
      }
    },
    [currentRun]
  );

  const addQuickTaskToRun = useCallback(
    (name: string, durationMs: number) => {
      if (currentRun) {
        setCurrentRun(addQuickTask(currentRun, name, durationMs));
      }
    },
    [currentRun]
  );

  const toggleTaskSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      if (currentRun) {
        setCurrentRun(toggleSubtask(currentRun, taskId, subtaskId));
      }
    },
    [currentRun]
  );

  const toggleTaskAutoAdvance = useCallback(
    (taskId: string) => {
      if (currentRun) {
        setCurrentRun(toggleAutoAdvance(currentRun, taskId));
      }
    },
    [currentRun]
  );

  return (
    <RunContext.Provider
      value={{
        currentRun,
        setCurrentRun,
        startCurrentRun,
        pauseCurrentRun,
        resumeCurrentRun,
        endCurrentRun,
        advanceTask,
        skipCurrentTask,
        extendCurrentTask,
        moveCurrentTask,
        addQuickTaskToRun,
        toggleTaskSubtask,
        toggleTaskAutoAdvance,
      }}
    >
      {children}
    </RunContext.Provider>
  );
}

export function useRun(): RunContextValue {
  const context = useContext(RunContext);
  if (!context) {
    throw new Error('useRun must be used within RunProvider');
  }
  return context;
}
