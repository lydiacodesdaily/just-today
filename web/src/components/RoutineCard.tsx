/**
 * RoutineCard.tsx
 * Component for displaying a routine template card
 */

'use client';

import { useState } from 'react';
import { RoutineTemplate, EnergyMode } from '@/src/models/RoutineTemplate';
import { deriveTasksForEnergyMode, useRoutineStore } from '@/src/stores/routineStore';

interface RoutineCardProps {
  routine: RoutineTemplate;
  energyMode: EnergyMode;
  onStart: () => void;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function RoutineCard({ routine, energyMode, onStart }: RoutineCardProps) {
  const filteredTasks = deriveTasksForEnergyMode(routine.tasks, energyMode);
  const totalDuration = filteredTasks.reduce((sum, task) => sum + task.durationMs, 0);

  return (
    <div className="bg-calm-surface border border-calm-border rounded-lg p-5 hover:border-calm-text/30 transition-colors">
      {/* Info section */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-calm-text mb-1">{routine.name}</h3>
        {routine.description && (
          <p className="text-sm text-calm-muted mb-3">{routine.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-calm-muted">
          <span>
            {filteredTasks.length} {routine.tasks.length !== filteredTasks.length && `of ${routine.tasks.length}`} task{filteredTasks.length === 1 ? '' : 's'}
          </span>
          <span>•</span>
          <span>{formatDuration(totalDuration)}</span>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="w-full px-4 py-2.5 bg-calm-text text-calm-surface rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
      >
        Start Routine
      </button>
    </div>
  );
}

interface RoutinesListProps {
  energyMode: EnergyMode;
}

export function RoutinesList({ energyMode }: RoutinesListProps) {
  const { templates } = useRoutineStore();

  const VISIBLE_ROUTINES_LIMIT = 2;
  const [showAll, setShowAll] = useState(false);

  const visibleRoutines = showAll ? templates : templates.slice(0, VISIBLE_ROUTINES_LIMIT);

  const getTitle = () => {
    switch (energyMode) {
      case 'low':
        return 'Your Essential Routines';
      case 'steady':
        return 'Your Routines';
      case 'flow':
        return 'Your Full Routines';
      default:
        return 'Your Routines';
    }
  };

  if (templates.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-calm-text">{getTitle()}</h2>
        <div className="bg-calm-surface border border-calm-border rounded-lg p-8 text-center">
          <p className="text-calm-muted mb-4">No routines created yet</p>
          <button className="text-calm-text hover:underline text-sm">
            Create your first routine
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-calm-text">{getTitle()}</h2>

      <div className="space-y-3">
        {visibleRoutines.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            energyMode={energyMode}
            onStart={() => {
              // TODO: Start routine (will be implemented with routine run functionality)
              console.log('Starting routine:', routine.id);
            }}
          />
        ))}

        {templates.length > VISIBLE_ROUTINES_LIMIT && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-3 text-sm text-calm-muted hover:text-calm-text transition-colors"
          >
            View all routines
          </button>
        )}

        {showAll && templates.length > VISIBLE_ROUTINES_LIMIT && (
          <button
            onClick={() => setShowAll(false)}
            className="w-full py-3 text-sm text-calm-muted hover:text-calm-text transition-colors"
          >
            Show less
          </button>
        )}
      </div>
    </section>
  );
}
