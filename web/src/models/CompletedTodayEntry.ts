/**
 * CompletedTodayEntry.ts
 * Model for entries in the Completed Today section
 * Shows evidence of work for the day - both tasks and routine completions
 */

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

  // For tasks - reference to original item for undo
  sourceItemId?: string;

  // For routines - reference to the routine template
  routineTemplateId?: string;
}

/**
 * Create a completed task entry
 */
export function createCompletedTaskEntry(
  sourceItemId: string,
  title: string
): CompletedTodayEntry {
  return {
    id: `completed-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'task',
    title,
    completedAt: new Date().toISOString(),
    sourceItemId,
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
