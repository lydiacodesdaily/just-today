/**
 * RoutineRun.ts
 * Defines the runtime state of an active routine execution.
 */

import { EnergyMode } from './RoutineTemplate';

export type RunTaskStatus = 'pending' | 'active' | 'completed' | 'skipped';

export interface RunSubtask {
  id: string;
  text: string;
  checked: boolean;
  order: number;
}

export interface RunTask {
  id: string;
  /** Reference to original template task ID */
  templateTaskId: string;
  name: string;
  /** Planned duration in milliseconds */
  durationMs: number;
  /** Subtasks with checked state */
  subtasks?: RunSubtask[];
  /** Current status */
  status: RunTaskStatus;
  /** Order in the current run queue */
  order: number;
  /** Timestamp when task was started (null if not started yet) */
  startedAt: number | null;
  /** Timestamp when task should end based on planned duration */
  plannedEndAt: number | null;
  /** Total time added via extend actions (milliseconds) */
  extensionMs: number;
  /** Timestamp when task was completed/skipped */
  completedAt: number | null;
  /** Track which 5-minute overtime intervals we've announced (e.g., [5, 10, 15]) */
  overtimeAnnouncedMinutes: number[];
  /** Track which time milestones we've announced (e.g., [5, 10, 15]) */
  milestoneAnnouncedMinutes: number[];
  /** If true, automatically advance to next task when timer reaches 0 */
  autoAdvance: boolean;
  /** If true, we've already announced the 1-minute warning for auto-advance */
  autoAdvanceWarningAnnounced: boolean;
  /** If true, we've already announced that time is up (for non-auto-advance tasks) */
  timeUpAnnounced: boolean;
}

export type RunStatus = 'notStarted' | 'running' | 'paused' | 'completed' | 'abandoned';

export interface RoutineRun {
  id: string;
  /** Reference to the template this run was created from */
  templateId: string;
  templateName: string;
  /** Energy mode selected for this run */
  energyMode: EnergyMode;
  /** All tasks in this run (derived from template based on energy mode) */
  tasks: RunTask[];
  /** Current run status */
  status: RunStatus;
  /** Timestamp when run was created */
  createdAt: number;
  /** Timestamp when run was started (first task activated) */
  startedAt: number | null;
  /** Timestamp when run was paused (if currently paused) */
  pausedAt: number | null;
  /** Total accumulated pause time in milliseconds */
  totalPauseMs: number;
  /** Timestamp when run ended (completed or abandoned) */
  endedAt: number | null;
  /** ID of currently active task (null if none) */
  activeTaskId: string | null;
  /** Source FocusItem ID if this run was created from a FocusItem */
  sourceFocusItemId?: string;
  /** Source Optional Item ID if this run was created from an OptionalItem */
  sourceOptionalItemId?: string;
}
