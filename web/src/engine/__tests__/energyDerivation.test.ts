/**
 * energyDerivation.test.ts
 * Unit tests for energy mode task filtering.
 */

import { deriveTasksForEnergyMode } from '../energyDerivation';
import { RoutineTask } from '../../models/RoutineTemplate';

describe('energyDerivation', () => {
  const tasks: RoutineTask[] = [
    {
      id: '1',
      name: 'Default Task',
      durationMs: 5 * 60 * 1000,
      order: 0,
      lowSafe: false,
      flowExtra: false,
      autoAdvance: false,
    },
    {
      id: '2',
      name: 'Low Safe Task',
      durationMs: 3 * 60 * 1000,
      order: 1,
      lowSafe: true,
      flowExtra: false,
      autoAdvance: false,
    },
    {
      id: '3',
      name: 'Flow Extra Task',
      durationMs: 10 * 60 * 1000,
      order: 2,
      lowSafe: false,
      flowExtra: true,
      autoAdvance: false,
    },
    {
      id: '4',
      name: 'Both Low and Flow Task',
      durationMs: 7 * 60 * 1000,
      order: 3,
      lowSafe: true,
      flowExtra: true,
      autoAdvance: false,
    },
  ];

  describe('deriveTasksForEnergyMode', () => {
    it('low mode: only shows lowSafe tasks', () => {
      const filtered = deriveTasksForEnergyMode(tasks, 'low');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(t => t.id)).toEqual(['2', '4']);
    });

    it('steady mode: excludes flowExtra-only tasks', () => {
      const filtered = deriveTasksForEnergyMode(tasks, 'steady');
      expect(filtered).toHaveLength(3);
      expect(filtered.map(t => t.id)).toEqual(['1', '2', '4']);
      // Should NOT include task 3 (flowExtra without lowSafe)
    });

    it('steady mode: includes tasks that are both lowSafe and flowExtra', () => {
      const filtered = deriveTasksForEnergyMode(tasks, 'steady');
      expect(filtered.find(t => t.id === '4')).toBeDefined();
    });

    it('flow mode: shows all tasks', () => {
      const filtered = deriveTasksForEnergyMode(tasks, 'flow');
      expect(filtered).toHaveLength(4);
      expect(filtered.map(t => t.id)).toEqual(['1', '2', '3', '4']);
    });

    it('preserves task order', () => {
      const filtered = deriveTasksForEnergyMode(tasks, 'flow');
      const orders = filtered.map(t => t.order);
      expect(orders).toEqual([0, 1, 2, 3]);
    });

    it('returns empty array when no tasks match', () => {
      const noLowTasks: RoutineTask[] = [
        {
          id: '1',
          name: 'No Low Task',
          durationMs: 5 * 60 * 1000,
          order: 0,
          lowSafe: false,
          flowExtra: false,
          autoAdvance: false,
        },
      ];
      const filtered = deriveTasksForEnergyMode(noLowTasks, 'low');
      expect(filtered).toHaveLength(0);
    });

    it('returns empty array for empty input', () => {
      const filtered = deriveTasksForEnergyMode([], 'low');
      expect(filtered).toHaveLength(0);
    });
  });
});
