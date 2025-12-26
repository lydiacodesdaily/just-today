/**
 * templateStore.ts
 * CRUD operations for routine templates.
 */

import { RoutineTemplate } from '../models/RoutineTemplate';
import { getItem, setItem, KEYS } from './storage';

/**
 * Loads all templates from storage.
 */
export async function loadTemplates(): Promise<RoutineTemplate[]> {
  const templates = await getItem<RoutineTemplate[]>(KEYS.TEMPLATES);
  return templates || [];
}

/**
 * Saves all templates to storage.
 */
export async function saveTemplates(
  templates: RoutineTemplate[]
): Promise<void> {
  await setItem(KEYS.TEMPLATES, templates);
}

/**
 * Gets a single template by ID.
 */
export async function getTemplate(
  id: string
): Promise<RoutineTemplate | null> {
  const templates = await loadTemplates();
  return templates.find((t) => t.id === id) || null;
}

/**
 * Creates a new template.
 */
export async function createTemplate(
  template: Omit<RoutineTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RoutineTemplate> {
  const templates = await loadTemplates();
  const newTemplate: RoutineTemplate = {
    ...template,
    id: `template-${Date.now()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  templates.push(newTemplate);
  await saveTemplates(templates);
  return newTemplate;
}

/**
 * Updates an existing template.
 */
export async function updateTemplate(
  id: string,
  updates: Partial<Omit<RoutineTemplate, 'id' | 'createdAt'>>
): Promise<RoutineTemplate | null> {
  const templates = await loadTemplates();
  const index = templates.findIndex((t) => t.id === id);

  if (index === -1) {
    return null;
  }

  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: Date.now(),
  };

  await saveTemplates(templates);
  return templates[index];
}

/**
 * Deletes a template.
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  const templates = await loadTemplates();
  const filtered = templates.filter((t) => t.id !== id);

  if (filtered.length === templates.length) {
    return false; // Template not found
  }

  await saveTemplates(filtered);
  return true;
}
