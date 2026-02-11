/**
 * projectStore.ts
 * Storage operations for Projects
 */

import { Project, createProject } from '../models/Project';
import { getItem, setItem, KEYS } from './storage';
import { FocusItem } from '../models/FocusItem';
import { BrainDumpItem } from '../models/BrainDumpItem';

/**
 * Load all projects
 */
export async function loadProjects(): Promise<Project[]> {
  try {
    const projects = await getItem<Project[]>(KEYS.PROJECTS);
    return projects || [];
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
}

/**
 * Save all projects
 */
async function saveProjects(projects: Project[]): Promise<void> {
  try {
    await setItem(KEYS.PROJECTS, projects);
  } catch (error) {
    console.error('Failed to save projects:', error);
  }
}

/**
 * Add a new project
 */
export async function addProject(name: string): Promise<Project> {
  const projects = await loadProjects();
  const newProject = createProject(name);
  projects.push(newProject);
  await saveProjects(projects);
  return newProject;
}

/**
 * Rename a project
 */
export async function renameProject(projectId: string, newName: string): Promise<void> {
  const projects = await loadProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return;

  projects[index] = { ...projects[index], name: newName.trim() };
  await saveProjects(projects);
}

/**
 * Delete a project and nullify projectId on all items that referenced it
 */
export async function deleteProject(projectId: string): Promise<void> {
  // Remove the project
  const projects = await loadProjects();
  await saveProjects(projects.filter((p) => p.id !== projectId));

  // Nullify projectId on focus items
  const focusItems = await getItem<FocusItem[]>(KEYS.FOCUS_ITEMS);
  if (focusItems) {
    const updated = focusItems.map((item) =>
      item.projectId === projectId ? { ...item, projectId: null } : item
    );
    await setItem(KEYS.FOCUS_ITEMS, updated);
  }

  // Nullify projectId on brain dump items
  const brainDumpItems = await getItem<BrainDumpItem[]>(KEYS.BRAIN_DUMP_ITEMS);
  if (brainDumpItems) {
    const updated = brainDumpItems.map((item) =>
      item.projectId === projectId ? { ...item, projectId: null } : item
    );
    await setItem(KEYS.BRAIN_DUMP_ITEMS, updated);
  }
}
