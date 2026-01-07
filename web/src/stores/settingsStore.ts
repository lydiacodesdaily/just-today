/**
 * settingsStore.ts
 * Zustand store for user settings
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settings, DEFAULT_SETTINGS, TickingSoundType, ThemePreference } from '@/src/models/Settings';

interface SettingsStore {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);
