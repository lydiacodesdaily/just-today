/**
 * areaStore.ts
 * Zustand store for managing Areas (GTD Areas of Responsibility).
 * Areas are collapsible containers that group Projects.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Area, createArea } from '@/src/models/Area';
import { useProjectsStore } from './projectsStore';

interface AreaStore {
  areas: Area[];
  addArea: (name: string) => string; // returns new area id
  renameArea: (id: string, name: string) => void;
  deleteArea: (id: string) => void; // moves its projects to Unsorted
  toggleCollapsed: (id: string) => void;
}

export const useAreaStore = create<AreaStore>()(
  persist(
    (set, get) => ({
      areas: [],

      addArea: (name) => {
        const sortOrder = get().areas.length;
        const area = createArea(name, sortOrder);
        set((state) => ({ areas: [...state.areas, area] }));
        return area.id;
      },

      renameArea: (id, name) => {
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === id ? { ...a, name: name.trim() } : a
          ),
        }));
      },

      deleteArea: (id) => {
        // Un-assign all projects in this area (they fall into Unsorted)
        useProjectsStore.getState().clearAreaFromProjects(id);
        set((state) => ({
          areas: state.areas.filter((a) => a.id !== id),
        }));
      },

      toggleCollapsed: (id) => {
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === id ? { ...a, collapsed: !a.collapsed } : a
          ),
        }));
      },
    }),
    {
      name: 'areas-storage',
    }
  )
);
