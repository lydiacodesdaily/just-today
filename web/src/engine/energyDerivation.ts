/**
 * energyDerivation.ts
 * Derives which tasks are visible based on energy mode.
 */

import { RoutineTask, EnergyMode } from '../models/RoutineTemplate';

/**
 * Filters tasks based on the selected energy mode.
 *
 * - Low: Only tasks with lowSafe=true
 * - Steady: All tasks except those with flowExtra=true (and no lowSafe)
 * - Flow: All tasks (including flowExtra)
 */
export function deriveTasksForEnergyMode(
  tasks: RoutineTask[],
  energyMode: EnergyMode
): RoutineTask[] {
  return tasks.filter((task) => {
    switch (energyMode) {
      case 'low':
        // Only show tasks marked as lowSafe
        return task.lowSafe === true;

      case 'steady':
        // Show default tasks and lowSafe tasks, but NOT flowExtra-only tasks
        // A task is flowExtra-only if flowExtra=true AND lowSafe is not true
        if (task.flowExtra && !task.lowSafe) {
          return false;
        }
        return true;

      case 'flow':
        // Show everything
        return true;

      default:
        return true;
    }
  });
}
