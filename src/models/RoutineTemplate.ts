/**
 * RoutineTemplate.ts
 * Defines the saved routine templates and their tasks.
 */

export interface Subtask {
  id: string;
  text: string;
  /** Order within parent task */
  order: number;
}

export interface RoutineTask {
  id: string;
  name: string;
  /** Planned duration in milliseconds */
  durationMs: number;
  /** If true, this task appears in Low energy mode */
  lowIncluded?: boolean;
  /** If true, this task appears in Steady energy mode */
  steadyIncluded?: boolean;
  /** If true, this task appears in Flow energy mode */
  flowIncluded?: boolean;
  /** @deprecated Use lowIncluded instead */
  lowSafe?: boolean;
  /** @deprecated Use flowIncluded instead */
  flowExtra?: boolean;
  /** Optional subtasks for step-mode guidance */
  subtasks?: Subtask[];
  /** Order within routine */
  order: number;
  /** If true, automatically advance to next task when timer reaches 0 */
  autoAdvance?: boolean;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  /** e.g., "Morning", "Night" */
  description?: string;
  tasks: RoutineTask[];
  createdAt: number;
  updatedAt: number;
}

export type Pace = 'low' | 'steady' | 'flow';
