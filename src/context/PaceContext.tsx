/**
 * PaceContext.tsx
 * Manages daily pace state with automatic day reset.
 *
 * Pace is a daily state - resets automatically when the date changes.
 * On first open of each day, user should select their pace level.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Pace } from '../models/RoutineTemplate';
import { getItem, setItem, KEYS } from '../persistence/storage';

/** Get today's date as YYYY-MM-DD string */
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

interface PaceContextType {
  // State
  currentPace: Pace;
  hasSelectedForToday: boolean;
  isLoading: boolean;

  // Actions
  setPaceForToday: (pace: Pace) => Promise<void>;
  skipPaceSelection: () => Promise<void>;
}

const PaceContext = createContext<PaceContextType | null>(null);

export function PaceProvider({ children }: { children: ReactNode }) {
  const [currentPace, setCurrentPace] = useState<Pace>('steady');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed: has user selected pace for today?
  const hasSelectedForToday = selectedDate === getTodayDateString();

  // Load persisted state on mount
  useEffect(() => {
    async function loadState() {
      try {
        const [savedPace, savedDate] = await Promise.all([
          getItem<Pace>(KEYS.CURRENT_PACE),
          getItem<string>(KEYS.PACE_SELECTED_DATE),
        ]);

        const today = getTodayDateString();

        // If it's a new day, reset to default state
        if (savedDate !== today) {
          setCurrentPace('steady');
          setSelectedDate(null);
        } else {
          // Same day - restore saved state
          if (savedPace) setCurrentPace(savedPace);
          setSelectedDate(savedDate);
        }
      } catch (error) {
        console.error('Failed to load pace state:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadState();
  }, []);

  // Set pace for today - saves both the pace and today's date
  const setPaceForToday = useCallback(async (pace: Pace) => {
    const today = getTodayDateString();
    setCurrentPace(pace);
    setSelectedDate(today);

    await Promise.all([
      setItem(KEYS.CURRENT_PACE, pace),
      setItem(KEYS.PACE_SELECTED_DATE, today),
    ]);
  }, []);

  // User chose "I'll share later" - skip selection but mark as handled
  // Defaults to Steady and allows them to change later
  const skipPaceSelection = useCallback(async () => {
    const today = getTodayDateString();
    setCurrentPace('steady');
    setSelectedDate(today);

    await Promise.all([
      setItem(KEYS.CURRENT_PACE, 'steady'),
      setItem(KEYS.PACE_SELECTED_DATE, today),
    ]);
  }, []);

  return (
    <PaceContext.Provider
      value={{
        currentPace,
        hasSelectedForToday,
        isLoading,
        setPaceForToday,
        skipPaceSelection,
      }}
    >
      {children}
    </PaceContext.Provider>
  );
}

export function usePace(): PaceContextType {
  const context = useContext(PaceContext);
  if (!context) {
    throw new Error('usePace must be used within a PaceProvider');
  }
  return context;
}

