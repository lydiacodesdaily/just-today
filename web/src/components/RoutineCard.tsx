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
import { createRunFromTemplate, canResumeAbandonedRun, resumeAbandonedRun } from '@/src/engine/runEngine';
import { RoutineCreationModal } from './RoutineCreationModal';
import { SectionLabel } from './SectionLabel';

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
          className="w-full px-4 py-2.5 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
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
  const { currentRun, setCurrentRun } = useRunStore();
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineTemplate | null>(null);
  const [deletingRoutine, setDeletingRoutine] = useState<RoutineTemplate | null>(null);
  const [resumeDialogRoutine, setResumeDialogRoutine] = useState<RoutineTemplate | null>(null);

  const handleStartRoutine = (routine: RoutineTemplate) => {
    // Check if there's an abandoned run from today for the same routine
    if (canResumeAbandonedRun(currentRun, routine.id)) {
      setResumeDialogRoutine(routine);
      return;
    }

    // Create a new run from the template
    const run = createRunFromTemplate(routine, energyMode);
    setCurrentRun(run);
    // Navigate to run page
    router.push('/run');
  };

  const handleContinueRun = () => {
    if (resumeDialogRoutine && currentRun) {
      const resumedRun = resumeAbandonedRun(currentRun);
      setCurrentRun(resumedRun);
      setResumeDialogRoutine(null);
      router.push('/run');
    }
  };

  const handleStartFresh = () => {
    if (resumeDialogRoutine) {
      const run = createRunFromTemplate(resumeDialogRoutine, energyMode);
      setCurrentRun(run);
      setResumeDialogRoutine(null);
      router.push('/run');
    }
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

  if (templates.length === 0) {
    return (
      <>
        <section className="space-y-4">
          <SectionLabel>Routines</SectionLabel>
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
          <SectionLabel>Routines</SectionLabel>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-xs"
          >
            New
          </button>
        </div>

        <div className="space-y-3">
          {templates.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              energyMode={energyMode}
              onStart={() => handleStartRoutine(routine)}
              onEdit={() => handleEditRoutine(routine)}
              onDelete={() => handleDeleteRoutine(routine)}
            />
          ))}
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

      {/* Resume Abandoned Run Dialog */}
      {resumeDialogRoutine && currentRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setResumeDialogRoutine(null)}
          />

          {/* Dialog */}
          <div className="relative bg-calm-surface border border-calm-border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header & Content */}
            <div className="px-6 py-6">
              <h3 className="text-xl font-bold text-calm-text mb-2">
                Continue {resumeDialogRoutine.name}?
              </h3>
              <p className="text-calm-muted">
                You made it through {currentRun.tasks.filter((t) => t.status === 'completed').length} of{' '}
                {currentRun.tasks.length} tasks earlier. Pick up where you left off, or start fresh.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-calm-border flex gap-3 justify-end">
              <button
                onClick={handleStartFresh}
                className="min-h-[48px] px-5 py-3 text-calm-text hover:bg-calm-border/50 rounded-lg transition-colors font-medium touch-manipulation"
              >
                Start Fresh
              </button>
              <button
                onClick={handleContinueRun}
                className="min-h-[48px] px-5 py-3 bg-calm-primary text-white hover:opacity-90 rounded-lg transition-opacity font-semibold touch-manipulation"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeletingRoutine(null)}
          />

          {/* Dialog */}
          <div className="relative bg-calm-surface border border-calm-border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header & Content */}
            <div className="px-6 py-6">
              <h3 className="text-xl font-bold text-calm-text mb-2">Delete Routine?</h3>
              <p className="text-calm-muted">
                Are you sure you want to delete "{deletingRoutine.name}"? This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-calm-border flex gap-3 justify-end">
              <button
                onClick={() => setDeletingRoutine(null)}
                className="min-h-[48px] px-5 py-3 text-calm-text hover:bg-calm-border/50 rounded-lg transition-colors font-medium touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="min-h-[48px] px-5 py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-semibold touch-manipulation"
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
