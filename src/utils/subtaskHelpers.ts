/**
 * subtaskHelpers.ts
 * Helper functions for subtask suggestions and management
 */

import { Subtask } from '../models/FocusItem';

export interface TaskPattern {
  keywords: string[];
  subtasks: Array<{
    text: string;
    durationMs: number;
  }>;
}

/**
 * Common task patterns with suggested subtask breakdowns
 */
export const TASK_PATTERNS: TaskPattern[] = [
  {
    keywords: ['write', 'report', 'document', 'paper', 'essay', 'article'],
    subtasks: [
      { text: 'Gather materials and notes', durationMs: 20 * 60 * 1000 },
      { text: 'Create outline', durationMs: 15 * 60 * 1000 },
      { text: 'Write first draft', durationMs: 45 * 60 * 1000 },
      { text: 'Edit and refine', durationMs: 30 * 60 * 1000 },
    ],
  },
  {
    keywords: ['clean', 'organize', 'tidy', 'declutter', 'sort'],
    subtasks: [
      { text: 'Clear surfaces', durationMs: 10 * 60 * 1000 },
      { text: 'Sort items', durationMs: 15 * 60 * 1000 },
      { text: 'Put things away', durationMs: 20 * 60 * 1000 },
      { text: 'Final touches', durationMs: 10 * 60 * 1000 },
    ],
  },
  {
    keywords: ['prepare', 'cook', 'meal', 'dinner', 'lunch', 'breakfast'],
    subtasks: [
      { text: 'Gather ingredients', durationMs: 5 * 60 * 1000 },
      { text: 'Prep ingredients', durationMs: 15 * 60 * 1000 },
      { text: 'Cook', durationMs: 25 * 60 * 1000 },
      { text: 'Clean up', durationMs: 10 * 60 * 1000 },
    ],
  },
  {
    keywords: ['study', 'learn', 'practice', 'review'],
    subtasks: [
      { text: 'Review materials', durationMs: 15 * 60 * 1000 },
      { text: 'Take notes', durationMs: 20 * 60 * 1000 },
      { text: 'Practice exercises', durationMs: 30 * 60 * 1000 },
      { text: 'Review what you learned', durationMs: 10 * 60 * 1000 },
    ],
  },
  {
    keywords: ['plan', 'planning', 'schedule', 'budget'],
    subtasks: [
      { text: 'Gather information', durationMs: 15 * 60 * 1000 },
      { text: 'List options', durationMs: 15 * 60 * 1000 },
      { text: 'Make decisions', durationMs: 20 * 60 * 1000 },
      { text: 'Write down plan', durationMs: 10 * 60 * 1000 },
    ],
  },
];

/**
 * Generate a unique ID for subtasks
 */
export function generateSubtaskId(): string {
  return `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if a task should suggest subtask breakdown
 * Suggests for tasks > 1 hour
 */
export function shouldSuggestSubtasks(durationMs: number): boolean {
  const ONE_HOUR_MS = 60 * 60 * 1000;
  return durationMs >= ONE_HOUR_MS;
}

/**
 * Get subtask suggestions based on task text
 * Returns null if no pattern matches
 */
export function getSubtaskSuggestions(taskText: string): Subtask[] | null {
  const normalizedText = taskText.toLowerCase();

  for (const pattern of TASK_PATTERNS) {
    const matches = pattern.keywords.some(keyword =>
      normalizedText.includes(keyword)
    );

    if (matches) {
      return pattern.subtasks.map((st, index) => ({
        id: generateSubtaskId(),
        text: st.text,
        order: index,
        completed: false,
        estimatedDurationMs: st.durationMs,
      }));
    }
  }

  return null;
}

/**
 * Calculate total estimated time for subtasks
 */
export function calculateSubtasksTotalTime(subtasks: Subtask[]): number {
  return subtasks.reduce((total, st) => {
    return total + (st.estimatedDurationMs || 0);
  }, 0);
}

/**
 * Format duration from milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  const minutes = Math.round(ms / (60 * 1000));

  if (minutes < 60) {
    return `~${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `~${hours}hr`;
  }

  return `~${hours}hr ${remainingMinutes}min`;
}

/**
 * Get progress percentage for subtasks
 */
export function getSubtaskProgress(subtasks: Subtask[]): number {
  if (subtasks.length === 0) return 0;
  const completedCount = subtasks.filter(st => st.completed).length;
  return Math.round((completedCount / subtasks.length) * 100);
}

/**
 * Get completed subtask count
 */
export function getCompletedSubtaskCount(subtasks: Subtask[]): number {
  return subtasks.filter(st => st.completed).length;
}

/**
 * Check if all subtasks are completed
 */
export function areAllSubtasksCompleted(subtasks: Subtask[]): boolean {
  if (subtasks.length === 0) return false;
  return subtasks.every(st => st.completed);
}

/**
 * Sort subtasks by order
 */
export function sortSubtasksByOrder(subtasks: Subtask[]): Subtask[] {
  return [...subtasks].sort((a, b) => a.order - b.order);
}
