/**
 * Project.ts
 * Lightweight, optional grouping for focus items (next actions).
 * A focus item can belong to at most one project (or none).
 * Mirrors the mobile model at src/models/Project.ts
 */

export interface Project {
  id: string;
  name: string;
  areaId?: string; // Area this project belongs to; undefined = Unsorted
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string — updated on rename
}

export function createProject(name: string, areaId?: string): Project {
  const randomId = Math.random().toString(36).slice(2, 11);
  const now = new Date().toISOString();
  return {
    id: `project-${Date.now()}-${randomId}`,
    name: name.trim(),
    ...(areaId ? { areaId } : {}),
    createdAt: now,
    updatedAt: now,
  };
}
