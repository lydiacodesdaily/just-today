/**
 * paceDerivation.ts
 * Derives which tasks are visible based on pace.
 */

import { RoutineTask, Pace } from '../models/RoutineTemplate';

/**
 * Migrates a task from old flags (lowSafe, flowExtra) to new flags (lowIncluded, steadyIncluded, flowIncluded).
 * If no tags are selected, defaults to Steady only.
 */
function migrateTaskFlags(task: RoutineTask): {
  lowIncluded: boolean;
  steadyIncluded: boolean;
  flowIncluded: boolean;
} {
  // If new flags are already set, use them
  if (task.lowIncluded !== undefined || task.steadyIncluded !== undefined || task.flowIncluded !== undefined) {
    return {
      lowIncluded: task.lowIncluded || false,
      steadyIncluded: task.steadyIncluded || false,
      flowIncluded: task.flowIncluded || false,
    };
  }

  // Migrate from old flags
  const hasLowSafe = task.lowSafe === true;
  const hasFlowExtra = task.flowExtra === true;

  // Old logic:
  // - lowSafe=true → appears in Low, Steady, Flow
  // - flowExtra=true (without lowSafe) → appears in Flow only
  // - neither flag → appears in Steady, Flow

  if (hasLowSafe && hasFlowExtra) {
    // All paces
    return { lowIncluded: true, steadyIncluded: true, flowIncluded: true };
  } else if (hasLowSafe) {
    // Low pace (also appears in Steady and Flow in old logic)
    return { lowIncluded: true, steadyIncluded: true, flowIncluded: true };
  } else if (hasFlowExtra) {
    // Flow only
    return { lowIncluded: false, steadyIncluded: false, flowIncluded: true };
  } else {
    // Default: Steady only (new default behavior)
    return { lowIncluded: false, steadyIncluded: true, flowIncluded: false };
  }
}

/**
 * Filters tasks based on the selected pace.
 *
 * New logic:
 * - If no tags selected → appears in Steady only (new default)
 * - Low tag → add to Low pace
 * - Steady tag → add to Steady pace
 * - Flow tag → add to Flow pace
 * - Can combine them however you want
 */
export function deriveTasksForPace(
  tasks: RoutineTask[],
  pace: Pace
): RoutineTask[] {
  return tasks.filter((task) => {
    const { lowIncluded, steadyIncluded, flowIncluded } = migrateTaskFlags(task);

    // If no tags selected at all, default to Steady only
    if (!lowIncluded && !steadyIncluded && !flowIncluded) {
      return pace === 'steady';
    }

    // Otherwise, check if the current pace is included
    switch (pace) {
      case 'low':
        return lowIncluded;
      case 'steady':
        return steadyIncluded;
      case 'flow':
        return flowIncluded;
      default:
        return true;
    }
  });
}
