/**
 * projectsStore.ts
 * Zustand store for managing Projects (GTD-style outcome containers)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, createProject } from '@/src/models/Project';
import { useFocusStore } from './focusStore';

interface ProjectsStore {
  projects: Project[];
  addProject: (name: string) => string; // returns new project id
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
}

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set) => ({
      projects: [],

      addProject: (name) => {
        const project = createProject(name);
        set((state) => ({
          projects: [...state.projects, project],
        }));
        return project.id;
      },

      renameProject: (id, name) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name: name.trim(), updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProject: (id) => {
        // Un-assign all focus items that belong to this project
        useFocusStore.getState().clearProjectFromItems(id);

        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },
    }),
    {
      name: 'projects-storage',
    }
  )
);
