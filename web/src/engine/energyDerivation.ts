/**
 * energyDerivation.ts
 * Derives which tasks are visible based on energy mode.
 */

import { RoutineTask, EnergyMode } from '../models/RoutineTemplate';

/**
 * Migrates a task from old flags (lowSafe, flowExtra) to new flags (lowIncluded, steadyIncluded, flowIncluded).
 * If no tags are selected, defaults to Steady mode only.
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
    // All energy modes
    return { lowIncluded: true, steadyIncluded: true, flowIncluded: true };
  } else if (hasLowSafe) {
    // Low energy mode (also appears in Steady and Flow in old logic)
    return { lowIncluded: true, steadyIncluded: true, flowIncluded: true };
  } else if (hasFlowExtra) {
    // Flow mode only
    return { lowIncluded: false, steadyIncluded: false, flowIncluded: true };
  } else {
    // Default: Steady mode only (new default behavior)
    return { lowIncluded: false, steadyIncluded: true, flowIncluded: false };
  }
}

/**
 * Filters tasks based on the selected energy mode.
 *
 * New logic:
 * - If no tags selected → appears in Steady only (new default)
 * - Low tag → add to Low mode
 * - Steady tag → add to Steady mode
 * - Flow tag → add to Flow mode
 * - Can combine them however you want
 */
export function deriveTasksForEnergyMode(
  tasks: RoutineTask[],
  energyMode: EnergyMode
): RoutineTask[] {
  return tasks.filter((task) => {
    const { lowIncluded, steadyIncluded, flowIncluded } = migrateTaskFlags(task);

    // If no tags selected at all, default to Steady only
    if (!lowIncluded && !steadyIncluded && !flowIncluded) {
      return energyMode === 'steady';
    }

    // Otherwise, check if the current energy mode is included
    switch (energyMode) {
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
