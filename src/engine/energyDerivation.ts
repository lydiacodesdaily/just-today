/**
 * energyDerivation.ts
 * Derives which tasks are visible based on energy mode.
 */

import { RoutineTask, EnergyMode } from '../models/RoutineTemplate';

/**
 * Filters tasks based on the selected energy mode.
 *
 * - Care: Only tasks with careSafe=true
 * - Steady: All tasks except those with flowExtra=true (and no careSafe)
 * - Flow: All tasks (including flowExtra)
 */
export function deriveTasksForEnergyMode(
  tasks: RoutineTask[],
  energyMode: EnergyMode
): RoutineTask[] {
  return tasks.filter((task) => {
    switch (energyMode) {
      case 'care':
        // Only show tasks marked as careSafe
        return task.careSafe === true;

      case 'steady':
        // Show default tasks and careSafe tasks, but NOT flowExtra-only tasks
        // A task is flowExtra-only if flowExtra=true AND careSafe is not true
        if (task.flowExtra && !task.careSafe) {
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
