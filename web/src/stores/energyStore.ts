/**
 * energyStore.ts
 * Zustand store for managing Energy Mode selection
 *
 * On web, energy is a simple preference that persists.
 * Users can change it anytime via the header indicator.
 * No daily gate - web users expect direct access to content.
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
      // Initial state - default to steady
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
