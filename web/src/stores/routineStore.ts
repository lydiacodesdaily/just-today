/**
 * routineStore.ts
 * Zustand store for managing Routine Templates
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoutineTemplate, RoutineTask, EnergyMode } from '@/src/models/RoutineTemplate';

interface RoutineStore {
  // State
  templates: RoutineTemplate[];

  // Actions
  addTemplate: (name: string, description?: string) => string;
  updateTemplate: (id: string, updates: Partial<RoutineTemplate>) => void;
  deleteTemplate: (id: string) => void;
  addTask: (templateId: string, task: Omit<RoutineTask, 'id' | 'order'>) => void;
  updateTask: (templateId: string, taskId: string, updates: Partial<RoutineTask>) => void;
  deleteTask: (templateId: string, taskId: string) => void;
}

/**
 * Helper to filter tasks based on energy mode
 */
export function deriveTasksForEnergyMode(tasks: RoutineTask[], mode: EnergyMode): RoutineTask[] {
  return tasks.filter((task) => {
    if (mode === 'low') {
      // Low mode: only lowSafe tasks
      return task.lowSafe === true;
    } else if (mode === 'steady') {
      // Steady mode: all except flowExtra
      return !task.flowExtra;
    } else {
      // Flow mode: all tasks
      return true;
    }
  });
}

export const useRoutineStore = create<RoutineStore>()(
  persist(
    (set) => ({
      // Initial state
      templates: [],

      // Add new template
      addTemplate: (name, description) => {
        const now = Date.now();
        const id = `routine-${now}-${Math.random().toString(36).substring(2, 11)}`;

        const template: RoutineTemplate = {
          id,
          name,
          description,
          tasks: [],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          templates: [...state.templates, template],
        }));

        return id;
      },

      // Update template
      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? { ...template, ...updates, updatedAt: Date.now() }
              : template
          ),
        }));
      },

      // Delete template
      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }));
      },

      // Add task to template
      addTask: (templateId, task) => {
        set((state) => ({
          templates: state.templates.map((template) => {
            if (template.id !== templateId) return template;

            const newTask: RoutineTask = {
              ...task,
              id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
              order: template.tasks.length,
            };

            return {
              ...template,
              tasks: [...template.tasks, newTask],
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      // Update task
      updateTask: (templateId, taskId, updates) => {
        set((state) => ({
          templates: state.templates.map((template) => {
            if (template.id !== templateId) return template;

            return {
              ...template,
              tasks: template.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      // Delete task
      deleteTask: (templateId, taskId) => {
        set((state) => ({
          templates: state.templates.map((template) => {
            if (template.id !== templateId) return template;

            return {
              ...template,
              tasks: template.tasks.filter((task) => task.id !== taskId),
              updatedAt: Date.now(),
            };
          }),
        }));
      },
    }),
    {
      name: 'routine-storage',
    }
  )
);
