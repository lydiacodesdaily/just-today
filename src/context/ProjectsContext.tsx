/**
 * ProjectsContext.tsx
 * Context provider for managing Projects
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Project } from '../models/Project';
import {
  loadProjects,
  addProject as persistAddProject,
  renameProject as persistRenameProject,
  deleteProject as persistDeleteProject,
} from '../persistence/projectStore';

interface ProjectsContextValue {
  projects: Project[];
  isLoading: boolean;

  addProject: (name: string) => Promise<Project>;
  renameProject: (projectId: string, newName: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  getProjectName: (projectId: string | null | undefined) => string | null;
  refreshProjects: () => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await loadProjects();
      setProjects(loaded);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addProject = useCallback(async (name: string): Promise<Project> => {
    const newProject = await persistAddProject(name);
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, []);

  const renameProject = useCallback(async (projectId: string, newName: string): Promise<void> => {
    await persistRenameProject(projectId, newName);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, name: newName.trim() } : p))
    );
  }, []);

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    await persistDeleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  }, []);

  const getProjectName = useCallback(
    (projectId: string | null | undefined): string | null => {
      if (!projectId) return null;
      const project = projects.find((p) => p.id === projectId);
      return project?.name ?? null;
    },
    [projects]
  );

  const refreshProjects = useCallback(async (): Promise<void> => {
    await load();
  }, [load]);

  const value: ProjectsContextValue = useMemo(
    () => ({
      projects,
      isLoading,
      addProject,
      renameProject,
      deleteProject,
      getProjectName,
      refreshProjects,
    }),
    [projects, isLoading, addProject, renameProject, deleteProject, getProjectName, refreshProjects]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsContextValue {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}
