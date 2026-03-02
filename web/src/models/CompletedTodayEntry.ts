/**
 * CompletedTodayEntry.ts
 * Model for entries in the Completed Today section
 * Shows evidence of work for the day - both tasks and routine completions
 */

import type { FocusItem } from './FocusItem';

/**
 * Entry types for Completed Today
 * - task: A completed Today focus item
 * - routine: A completed routine session
 */
export type CompletedTodayEntryType = 'task' | 'routine';

/**
 * CompletedTodayEntry - Represents a completed item visible in the Completed Today section
 */
export interface CompletedTodayEntry {
  id: string;
  type: CompletedTodayEntryType;
  title: string;
  completedAt: string; // ISO date string

  // For tasks - full snapshot of original item for undo (restores all fields including projectId)
  sourceItem?: FocusItem;

  // For routines - reference to the routine template
  routineTemplateId?: string;
}

/**
 * Create a completed task entry
 */
export function createCompletedTaskEntry(
  sourceItem: FocusItem
): CompletedTodayEntry {
  return {
    id: `completed-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'task',
    title: sourceItem.title,
    completedAt: new Date().toISOString(),
    sourceItem,
  };
}

/**
 * Create a completed routine entry
 */
export function createCompletedRoutineEntry(
  routineTemplateId: string,
  routineName: string
): CompletedTodayEntry {
  return {
    id: `completed-routine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'routine',
    title: `${routineName} completed`,
    completedAt: new Date().toISOString(),
    routineTemplateId,
  };
}
