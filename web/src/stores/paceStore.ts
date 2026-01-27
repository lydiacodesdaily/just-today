/**
 * paceStore.ts
 * Zustand store for managing Pace selection
 *
 * On web, pace is a simple preference that persists.
 * Users can change it anytime via the header indicator.
 * No daily gate - web users expect direct access to content.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Pace } from '@/src/models/RoutineTemplate';

interface PaceStore {
  // State
  currentPace: Pace;

  // Actions
  setPace: (pace: Pace) => void;
}

export const usePaceStore = create<PaceStore>()(
  persist(
    (set) => ({
      // Initial state - default to steady
      currentPace: 'steady',

      // Set pace
      setPace: (pace) => {
        set({ currentPace: pace });
      },
    }),
    {
      name: 'pace-storage',
    }
  )
);
