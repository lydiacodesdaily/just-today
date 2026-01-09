/**
 * RoutineCard.tsx
 * Component for displaying a routine template card
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoutineTemplate, EnergyMode } from '@/src/models/RoutineTemplate';
import { deriveTasksForEnergyMode, useRoutineStore } from '@/src/stores/routineStore';
import { useRunStore } from '@/src/stores/runStore';
import { createRunFromTemplate } from '@/src/engine/runEngine';
import { RoutineCreationModal } from './RoutineCreationModal';

interface RoutineCardProps {
  routine: RoutineTemplate;
  energyMode: EnergyMode;
  onStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
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

export function RoutineCard({ routine, energyMode, onStart, onEdit, onDelete }: RoutineCardProps) {
  const filteredTasks = deriveTasksForEnergyMode(routine.tasks, energyMode);
  const totalDuration = filteredTasks.reduce((sum, task) => sum + task.durationMs, 0);

  // Get energy mode name for display
  const energyModeName = energyMode.charAt(0).toUpperCase() + energyMode.slice(1);
  const hasNoTasks = filteredTasks.length === 0;
  const isFiltered = filteredTasks.length < routine.tasks.length;

  return (
    <div className="bg-calm-surface border border-calm-border rounded-lg p-5 hover:border-calm-text/30 transition-colors">
      {/* Info section */}
      <div className={hasNoTasks ? 'mb-0' : 'mb-4'}>
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg font-semibold text-calm-text">{routine.name}</h3>
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-calm-muted hover:text-calm-text transition-colors"
              title="Edit routine"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-calm-muted hover:text-red-600 transition-colors"
              title="Delete routine"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
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

        {/* Empty state guidance when no tasks available */}
        {isFiltered && hasNoTasks && (
          <div className="mt-3 pt-3 border-t border-calm-border/50">
            <p className="text-sm text-calm-muted leading-relaxed">
              💫 No tasks for {energyModeName} mode
            </p>
            <p className="text-xs text-calm-muted/75 italic mt-1">
              Tap edit to add tasks
            </p>
          </div>
        )}
      </div>

      {/* Only show Start Routine button if there are tasks available */}
      {!hasNoTasks && (
        <button
          onClick={onStart}
          className="w-full px-4 py-2.5 bg-calm-text text-calm-surface rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
        >
          Start Routine
        </button>
      )}
    </div>
  );
}

interface RoutinesListProps {
  energyMode: EnergyMode;
}

export function RoutinesList({ energyMode }: RoutinesListProps) {
  const templates = useRoutineStore((state) => state.templates);
  const deleteTemplate = useRoutineStore((state) => state.deleteTemplate);
  const { setCurrentRun } = useRunStore();
  const router = useRouter();

  const VISIBLE_ROUTINES_LIMIT = 2;
  const [showAll, setShowAll] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineTemplate | null>(null);
  const [deletingRoutine, setDeletingRoutine] = useState<RoutineTemplate | null>(null);

  const visibleRoutines = showAll ? templates : templates.slice(0, VISIBLE_ROUTINES_LIMIT);

  const handleStartRoutine = (routine: RoutineTemplate) => {
    // Create a new run from the template
    const run = createRunFromTemplate(routine, energyMode);
    console.log('[RoutineCard] Created new run:', run.id, 'status:', run.status);
    setCurrentRun(run);
    // Navigate to run page
    router.push('/run');
  };

  const handleEditRoutine = (routine: RoutineTemplate) => {
    setEditingRoutine(routine);
  };

  const handleDeleteRoutine = (routine: RoutineTemplate) => {
    setDeletingRoutine(routine);
  };

  const confirmDelete = () => {
    if (deletingRoutine) {
      deleteTemplate(deletingRoutine.id);
      setDeletingRoutine(null);
    }
  };

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
      <>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-calm-text">{getTitle()}</h2>
          <div className="bg-calm-surface border border-calm-border rounded-lg p-8 text-center">
            <p className="text-calm-muted mb-4">No routines created yet</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-calm-text hover:underline text-sm"
            >
              Create your first routine
            </button>
          </div>
        </section>
        <RoutineCreationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-calm-text">{getTitle()}</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-calm-text text-calm-surface rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            New
          </button>
        </div>

        <div className="space-y-3">
          {visibleRoutines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              energyMode={energyMode}
              onStart={() => handleStartRoutine(routine)}
              onEdit={() => handleEditRoutine(routine)}
              onDelete={() => handleDeleteRoutine(routine)}
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

      {/* Create/Edit Modal */}
      <RoutineCreationModal
        isOpen={isCreateModalOpen || editingRoutine !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingRoutine(null);
        }}
        editingRoutine={editingRoutine}
      />

      {/* Delete Confirmation Dialog */}
      {deletingRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeletingRoutine(null)}
          />

          {/* Dialog */}
          <div className="relative bg-calm-surface rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-calm-text mb-2">Delete Routine?</h3>
            <p className="text-calm-muted mb-6">
              Are you sure you want to delete "{deletingRoutine.name}"? This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingRoutine(null)}
                className="px-5 py-2.5 text-calm-text hover:bg-calm-border/50 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
