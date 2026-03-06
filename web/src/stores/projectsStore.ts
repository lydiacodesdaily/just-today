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
  addProject: (name: string, areaId?: string) => string; // returns new project id
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  setProjectArea: (id: string, areaId: string | undefined) => void;
  clearAreaFromProjects: (areaId: string) => void;
}

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set) => ({
      projects: [],

      addProject: (name, areaId) => {
        const project = createProject(name, areaId);
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

      setProjectArea: (id, areaId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, areaId, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      clearAreaFromProjects: (areaId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.areaId === areaId ? { ...p, areaId: undefined, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
    }),
    {
      name: 'projects-storage',
    }
  )
);
