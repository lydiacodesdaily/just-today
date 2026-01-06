/**
 * energyStore.ts
 * Zustand store for managing Energy Mode selection
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EnergyMode } from '@/src/models/RoutineTemplate';

interface EnergyStore {
  // State
  currentMode: EnergyMode;

  // Actions
  setMode: (mode: EnergyMode) => void;
}

export const useEnergyStore = create<EnergyStore>()(
  persist(
    (set) => ({
      // Initial state
      currentMode: 'steady',

      // Set energy mode
      setMode: (mode) => {
        set({ currentMode: mode });
      },
    }),
    {
      name: 'energy-storage',
    }
  )
);
