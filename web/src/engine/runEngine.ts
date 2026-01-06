/**
 * runEngine.ts
 * Core functions for managing routine run lifecycle.
 */

import { RoutineTemplate, EnergyMode } from '../models/RoutineTemplate';
import { RoutineRun, RunTask, RunSubtask } from '../models/RoutineRun';
import { TodayOptionalItem } from '../models/EnergyMenuItem';
import { FocusItem, durationToMs } from '../models/FocusItem';
import { deriveTasksForEnergyMode } from './energyDerivation';
import {
  getTaskCompletionMessage,
  getTaskSkipMessage,
  getRoutineCompleteMessage,
  getFocusTaskCompleteMessage,
} from '../utils/transitionMessages';
import {
  sendTaskTransitionNotification,
  sendRoutineCompleteNotification,
} from '../lib/notifications';
import { speak } from '../lib/audio/tts';

/**
 * Creates a new RoutineRun from a template and energy mode.
 * Tasks are filtered based on energy mode and converted to RunTask instances.
 */
export function createRunFromTemplate(
  template: RoutineTemplate,
  energyMode: EnergyMode
): RoutineRun {
  const visibleTasks = deriveTasksForEnergyMode(template.tasks, energyMode);

  // Sort by order
  const sortedTasks = [...visibleTasks].sort((a, b) => a.order - b.order);

  const runTasks: RunTask[] = sortedTasks.map((task, index) => ({
    id: `run-task-${task.id}-${Date.now()}-${index}`,
    templateTaskId: task.id,
    name: task.name,
    durationMs: task.durationMs,
    subtasks: task.subtasks?.map((st) => ({
      id: st.id,
      text: st.text,
      checked: false,
      order: st.order,
    })),
    status: 'pending',
    order: index,
    startedAt: null,
    plannedEndAt: null,
    extensionMs: 0,
    completedAt: null,
    overtimeAnnouncedMinutes: [],
    milestoneAnnouncedMinutes: [],
    autoAdvance: task.autoAdvance ?? false,
    autoAdvanceWarningAnnounced: false,
    timeUpAnnounced: false,
  }));

  return {
    id: `run-${template.id}-${Date.now()}`,
    templateId: template.id,
    templateName: template.name,
    energyMode,
    tasks: runTasks,
    status: 'notStarted',
    createdAt: Date.now(),
    startedAt: null,
    pausedAt: null,
    totalPauseMs: 0,
    endedAt: null,
    activeTaskId: null,
  };
}

/**
 * Creates a single-task RoutineRun from a Today Optional Item.
 * Used for optional focus sessions (ad-hoc, single-task mode).
 */
export function createRunFromOptionalItem(item: TodayOptionalItem): RoutineRun {
  // Convert estimated duration string to milliseconds
  const durationMs = (() => {
    if (!item.estimatedDuration) return 15 * 60 * 1000; // Default 15 minutes
    const match = item.estimatedDuration.match(/~(\d+)/);
    if (!match) return 15 * 60 * 1000;
    return parseInt(match[1]) * 60 * 1000;
  })();

  const runTask: RunTask = {
    id: `optional-run-task-${item.id}-${Date.now()}`,
    templateTaskId: item.menuItemId,
    name: item.title,
    durationMs,
    subtasks: undefined,
    status: 'pending',
    order: 0,
    startedAt: null,
    plannedEndAt: null,
    extensionMs: 0,
    completedAt: null,
    overtimeAnnouncedMinutes: [],
    milestoneAnnouncedMinutes: [],
    autoAdvance: false,
    autoAdvanceWarningAnnounced: false,
    timeUpAnnounced: false,
  };

  return {
    id: `optional-run-${item.id}-${Date.now()}`,
    templateId: 'optional-item',
    templateName: `Optional: ${item.title}`,
    energyMode: 'steady', // Default energy mode for optional items
    tasks: [runTask],
    status: 'notStarted',
    createdAt: Date.now(),
    startedAt: null,
    pausedAt: null,
    totalPauseMs: 0,
    endedAt: null,
    activeTaskId: null,
  };
}

/**
 * Creates a single-task RoutineRun from a Focus Item (Today's Focus or Later).
 * Used for focus sessions on user-defined tasks.
 */
export function createRunFromFocusItem(item: FocusItem): RoutineRun {
  const durationMs = durationToMs(item.estimatedDuration);

  const runTask: RunTask = {
    id: `focus-run-task-${item.id}-${Date.now()}`,
    templateTaskId: item.id,
    name: item.title,
    durationMs,
    subtasks: undefined,
    status: 'pending',
    order: 0,
    startedAt: null,
    plannedEndAt: null,
    extensionMs: 0,
    completedAt: null,
    overtimeAnnouncedMinutes: [],
    milestoneAnnouncedMinutes: [],
    autoAdvance: false,
    autoAdvanceWarningAnnounced: false,
    timeUpAnnounced: false,
  };

  return {
    id: `focus-run-${item.id}-${Date.now()}`,
    templateId: 'focus-item',
    templateName: item.title,
    energyMode: 'steady', // Default energy mode for focus items
    tasks: [runTask],
    status: 'notStarted',
    createdAt: Date.now(),
    startedAt: null,
    pausedAt: null,
    totalPauseMs: 0,
    endedAt: null,
    activeTaskId: null,
  };
}

/**
 * Starts the run and activates the first pending task.
 */
export function startRun(run: RoutineRun): RoutineRun {
  if (run.status !== 'notStarted') {
    throw new Error('Run already started');
  }

  const now = Date.now();
  const firstTask = run.tasks.find((t) => t.status === 'pending');

  if (!firstTask) {
    // No tasks to run
    return {
      ...run,
      status: 'completed',
      startedAt: now,
      endedAt: now,
    };
  }

  return startTask(
    {
      ...run,
      status: 'running',
      startedAt: now,
    },
    firstTask.id
  );
}

/**
 * Starts a specific task (sets it to active and records timestamps).
 */
export function startTask(run: RoutineRun, taskId: string): RoutineRun {
  const now = Date.now();

  const updatedTasks = run.tasks.map((task) => {
    if (task.id === taskId) {
      const totalDuration = task.durationMs + task.extensionMs;
      return {
        ...task,
        status: 'active' as const,
        startedAt: now,
        plannedEndAt: now + totalDuration,
      };
    }
    return task;
  });

  return {
    ...run,
    tasks: updatedTasks,
    activeTaskId: taskId,
  };
}

/**
 * Pauses the currently running routine.
 */
export function pauseRun(run: RoutineRun): RoutineRun {
  if (run.status !== 'running') {
    throw new Error('Run is not running');
  }

  return {
    ...run,
    status: 'paused',
    pausedAt: Date.now(),
  };
}

/**
 * Resumes a paused routine.
 * Adjusts the active task's plannedEndAt to account for pause time.
 */
export function resumeRun(run: RoutineRun): RoutineRun {
  if (run.status !== 'paused' || !run.pausedAt) {
    throw new Error('Run is not paused');
  }

  const now = Date.now();
  const pauseDuration = now - run.pausedAt;

  const updatedTasks = run.tasks.map((task) => {
    if (task.id === run.activeTaskId && task.plannedEndAt) {
      return {
        ...task,
        plannedEndAt: task.plannedEndAt + pauseDuration,
      };
    }
    return task;
  });

  return {
    ...run,
    tasks: updatedTasks,
    status: 'running',
    totalPauseMs: run.totalPauseMs + pauseDuration,
    pausedAt: null,
  };
}

/**
 * Advances to the next pending task.
 * Marks the current task as completed if it exists.
 * Announces completion and sends notification.
 */
export async function advanceToNextTask(run: RoutineRun): Promise<RoutineRun> {
  const now = Date.now();

  // Get current task name before updating
  const currentTask = run.tasks.find((t) => t.id === run.activeTaskId);
  const currentTaskName = currentTask?.name || 'Task';

  // Mark current task as completed
  const updatedTasks = run.tasks.map((task) =>
    task.id === run.activeTaskId
      ? { ...task, status: 'completed' as const, completedAt: now }
      : task
  );

  // Find next pending task
  const nextTask = updatedTasks
    .filter((t) => t.status === 'pending')
    .sort((a, b) => a.order - b.order)[0];

  if (!nextTask) {
    // No more tasks - complete the run
    // Use different message for focus items vs routines
    const isFocusItem = run.templateId === 'focus-item' || run.templateId === 'optional-item';
    const completeMessage = isFocusItem
      ? getFocusTaskCompleteMessage()
      : getRoutineCompleteMessage();
    speak(completeMessage.ttsMessage);
    sendRoutineCompleteNotification();

    return {
      ...run,
      tasks: updatedTasks,
      status: 'completed',
      activeTaskId: null,
      endedAt: now,
    };
  }

  // Announce transition to next task
  const transitionMessage = getTaskCompletionMessage(
    currentTaskName,
    nextTask.name
  );
  speak(transitionMessage.ttsMessage);
  sendTaskTransitionNotification(currentTaskName, nextTask.name);

  // Start the next task
  return startTask(
    {
      ...run,
      tasks: updatedTasks,
    },
    nextTask.id
  );
}

/**
 * Skips a task (marks it as skipped).
 * If it's the active task, advance to next.
 * Announces skip and sends notification.
 */
export async function skipTask(
  run: RoutineRun,
  taskId: string
): Promise<RoutineRun> {
  const now = Date.now();
  const isActiveTask = run.activeTaskId === taskId;

  // Get task name before updating
  const skippedTask = run.tasks.find((t) => t.id === taskId);
  const skippedTaskName = skippedTask?.name || 'Task';

  const updatedTasks = run.tasks.map((task) =>
    task.id === taskId
      ? { ...task, status: 'skipped' as const, completedAt: now }
      : task
  );

  if (isActiveTask) {
    // Find next pending task
    const nextTask = updatedTasks
      .filter((t) => t.status === 'pending')
      .sort((a, b) => a.order - b.order)[0];

    if (!nextTask) {
      // No more tasks
      // Use different message for focus items vs routines
      const isFocusItem = run.templateId === 'focus-item' || run.templateId === 'optional-item';
      const completeMessage = isFocusItem
        ? getFocusTaskCompleteMessage()
        : getRoutineCompleteMessage();
      speak(completeMessage.ttsMessage);
      sendRoutineCompleteNotification();

      return {
        ...run,
        tasks: updatedTasks,
        status: 'completed',
        activeTaskId: null,
        endedAt: now,
      };
    }

    // Announce skip and transition
    const skipMessage = getTaskSkipMessage(skippedTaskName, nextTask.name);
    speak(skipMessage.ttsMessage);
    sendTaskTransitionNotification(skippedTaskName, nextTask.name);

    return startTask(
      {
        ...run,
        tasks: updatedTasks,
      },
      nextTask.id
    );
  }

  return {
    ...run,
    tasks: updatedTasks,
  };
}

/**
 * Extends or reduces a task's duration.
 *
 * For positive deltaMs (+1m, +5m):
 *   - Gives the user fresh time from 0, regardless of current overtime
 *   - If task is 2min overdue and user adds +5m, they get a full 5 minutes of positive time
 *   - Resets announcement flags so they trigger again naturally
 *
 * For negative deltaMs (-1m, -5m):
 *   - Moves the deadline closer by that amount
 *   - If task has 3min remaining and user presses -1m, they'll have 2min remaining
 *   - If task is overdue and user presses -1m, it increases the overtime
 *
 * This approach is calm and supportive: adding time always gives you what you asked for,
 * without punishing you for being overdue.
 */
export function extendTask(
  run: RoutineRun,
  taskId: string,
  deltaMs: number
): RoutineRun {
  const now = Date.now();

  const updatedTasks = run.tasks.map((task) => {
    if (task.id === taskId) {
      let newPlannedEndAt: number;

      if (deltaMs > 0) {
        // Adding time: give fresh time from 0
        // User gets exactly the time they requested, starting from now
        newPlannedEndAt = now + deltaMs;
      } else {
        // Reducing time: move deadline closer by deltaMs
        // This works whether we're in positive time or overtime
        newPlannedEndAt = (task.plannedEndAt || now) + deltaMs;
      }

      // Track the total extension (both positive and negative adjustments)
      const newExtension = task.extensionMs + deltaMs;

      return {
        ...task,
        extensionMs: newExtension,
        plannedEndAt: newPlannedEndAt,
        // Reset announcement flags when adding time, so they can trigger naturally again
        timeUpAnnounced: deltaMs > 0 ? false : task.timeUpAnnounced,
        // Clear overtime tracking when adding time (fresh start)
        overtimeAnnouncedMinutes: deltaMs > 0 ? [] : task.overtimeAnnouncedMinutes,
        // Keep milestone tracking as-is (those track actual elapsed time)
      };
    }
    return task;
  });

  return {
    ...run,
    tasks: updatedTasks,
  };
}

/**
 * Moves a task within the queue.
 * Position can be: 'up' (swap with previous), 'down' (swap with next),
 * 'next' (move to position right after active), 'end' (move to last),
 * or a specific index number.
 */
export function moveTask(
  run: RoutineRun,
  taskId: string,
  position: 'up' | 'down' | 'next' | 'end' | number
): RoutineRun {
  const task = run.tasks.find((t) => t.id === taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  // Cannot move completed/skipped tasks
  if (task.status === 'completed' || task.status === 'skipped') {
    throw new Error('Cannot move completed or skipped task');
  }

  // Cannot move the active task
  if (task.status === 'active') {
    throw new Error('Cannot move the active task');
  }

  const pendingTasks = run.tasks.filter((t) => t.status === 'pending');
  const currentIndex = pendingTasks.findIndex((t) => t.id === taskId);

  if (currentIndex === -1) {
    throw new Error('Task is not in pending queue');
  }

  let targetIndex: number;

  switch (position) {
    case 'up':
      targetIndex = Math.max(0, currentIndex - 1);
      break;
    case 'down':
      targetIndex = Math.min(pendingTasks.length - 1, currentIndex + 1);
      break;
    case 'next':
      targetIndex = 0; // Move to front of pending queue (right after active)
      break;
    case 'end':
      targetIndex = pendingTasks.length - 1;
      break;
    default:
      targetIndex = Math.max(0, Math.min(pendingTasks.length - 1, position));
  }

  if (currentIndex === targetIndex) {
    return run; // No change needed
  }

  // Reorder pending tasks
  const reordered = [...pendingTasks];
  const [movedTask] = reordered.splice(currentIndex, 1);
  reordered.splice(targetIndex, 0, movedTask);

  // Rebuild tasks array with updated order
  const activeTask = run.tasks.find((t) => t.status === 'active');
  const completedTasks = run.tasks.filter(
    (t) => t.status === 'completed' || t.status === 'skipped'
  );

  const rebuiltTasks = [
    ...completedTasks,
    ...(activeTask ? [activeTask] : []),
    ...reordered,
  ].map((t, index) => ({ ...t, order: index }));

  return {
    ...run,
    tasks: rebuiltTasks,
  };
}

/**
 * Adds a quick task to the queue (inserted right after active task).
 */
export function addQuickTask(
  run: RoutineRun,
  name: string,
  durationMs: number
): RoutineRun {
  const newTask: RunTask = {
    id: `quick-task-${Date.now()}`,
    templateTaskId: 'quick',
    name,
    durationMs,
    status: 'pending',
    order: 0, // Will be reordered below
    startedAt: null,
    plannedEndAt: null,
    extensionMs: 0,
    completedAt: null,
    overtimeAnnouncedMinutes: [],
    milestoneAnnouncedMinutes: [],
    autoAdvance: false,
    autoAdvanceWarningAnnounced: false,
    timeUpAnnounced: false,
  };

  // Insert after active task
  const activeTask = run.tasks.find((t) => t.status === 'active');
  const completedTasks = run.tasks.filter(
    (t) => t.status === 'completed' || t.status === 'skipped'
  );
  const pendingTasks = run.tasks.filter((t) => t.status === 'pending');

  const rebuiltTasks = [
    ...completedTasks,
    ...(activeTask ? [activeTask] : []),
    newTask,
    ...pendingTasks,
  ].map((t, index) => ({ ...t, order: index }));

  return {
    ...run,
    tasks: rebuiltTasks,
  };
}

/**
 * Ends the run immediately (marks as abandoned if not completed).
 */
export function endRun(run: RoutineRun): RoutineRun {
  const now = Date.now();

  // Mark active task as skipped
  const updatedTasks = run.tasks.map((task) =>
    task.id === run.activeTaskId
      ? { ...task, status: 'skipped' as const, completedAt: now }
      : task
  );

  return {
    ...run,
    tasks: updatedTasks,
    status: 'abandoned',
    activeTaskId: null,
    endedAt: now,
  };
}

/**
 * Toggles a subtask's checked state.
 */
export function toggleSubtask(
  run: RoutineRun,
  taskId: string,
  subtaskId: string
): RoutineRun {
  const updatedTasks = run.tasks.map((task) => {
    if (task.id === taskId && task.subtasks) {
      return {
        ...task,
        subtasks: task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, checked: !st.checked } : st
        ),
      };
    }
    return task;
  });

  return {
    ...run,
    tasks: updatedTasks,
  };
}

/**
 * Toggles the auto-advance setting for a specific task during an active run.
 * This allows users to change their mind about auto-advancing in the moment.
 */
export function toggleAutoAdvance(
  run: RoutineRun,
  taskId: string
): RoutineRun {
  const updatedTasks = run.tasks.map((task) => {
    if (task.id === taskId) {
      return {
        ...task,
        autoAdvance: !task.autoAdvance,
        // Reset warning flag when toggling auto-advance
        autoAdvanceWarningAnnounced: false,
      };
    }
    return task;
  });

  return {
    ...run,
    tasks: updatedTasks,
  };
}
