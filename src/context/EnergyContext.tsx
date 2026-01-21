/**
 * EnergyContext.tsx
 * Manages daily energy state with automatic day reset.
 *
 * Energy is a daily state - resets automatically when the date changes.
 * On first open of each day, user should select their energy level.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { EnergyMode } from '../models/RoutineTemplate';
import { getItem, setItem, KEYS } from '../persistence/storage';

/** Get today's date as YYYY-MM-DD string */
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

interface EnergyContextType {
  // State
  currentMode: EnergyMode;
  hasSelectedForToday: boolean;
  isLoading: boolean;

  // Actions
  setEnergyForToday: (mode: EnergyMode) => Promise<void>;
  skipEnergySelection: () => Promise<void>;
}

const EnergyContext = createContext<EnergyContextType | null>(null);

export function EnergyProvider({ children }: { children: ReactNode }) {
  const [currentMode, setCurrentMode] = useState<EnergyMode>('steady');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed: has user selected energy for today?
  const hasSelectedForToday = selectedDate === getTodayDateString();

  // Load persisted state on mount
  useEffect(() => {
    async function loadState() {
      try {
        const [savedMode, savedDate] = await Promise.all([
          getItem<EnergyMode>(KEYS.CURRENT_ENERGY),
          getItem<string>(KEYS.ENERGY_SELECTED_DATE),
        ]);

        const today = getTodayDateString();

        // If it's a new day, reset to default state
        if (savedDate !== today) {
          setCurrentMode('steady');
          setSelectedDate(null);
        } else {
          // Same day - restore saved state
          if (savedMode) setCurrentMode(savedMode);
          setSelectedDate(savedDate);
        }
      } catch (error) {
        console.error('Failed to load energy state:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadState();
  }, []);

  // Set energy for today - saves both the mode and today's date
  const setEnergyForToday = useCallback(async (mode: EnergyMode) => {
    const today = getTodayDateString();
    setCurrentMode(mode);
    setSelectedDate(today);

    await Promise.all([
      setItem(KEYS.CURRENT_ENERGY, mode),
      setItem(KEYS.ENERGY_SELECTED_DATE, today),
    ]);
  }, []);

  // User chose "I'll share later" - skip selection but mark as handled
  // Defaults to Steady and allows them to change later
  const skipEnergySelection = useCallback(async () => {
    const today = getTodayDateString();
    setCurrentMode('steady');
    setSelectedDate(today);

    await Promise.all([
      setItem(KEYS.CURRENT_ENERGY, 'steady'),
      setItem(KEYS.ENERGY_SELECTED_DATE, today),
    ]);
  }, []);

  return (
    <EnergyContext.Provider
      value={{
        currentMode,
        hasSelectedForToday,
        isLoading,
        setEnergyForToday,
        skipEnergySelection,
      }}
    >
      {children}
    </EnergyContext.Provider>
  );
}

export function useEnergy(): EnergyContextType {
  const context = useContext(EnergyContext);
  if (!context) {
    throw new Error('useEnergy must be used within an EnergyProvider');
  }
  return context;
}
