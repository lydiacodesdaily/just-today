/**
 * Project.ts
 * Lightweight, optional grouping for tasks.
 * A task can belong to at most one project (or none).
 */

export interface Project {
  id: string;
  name: string;
  createdAt: string; // ISO date string
}

export function createProject(name: string): Project {
  const randomId = Math.random().toString(36).substr(2, 9);
  return {
    id: `project-${Date.now()}-${randomId}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
}
