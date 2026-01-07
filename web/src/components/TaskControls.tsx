/**
 * TaskControls.tsx
 * Control buttons for active task with primary/secondary/tertiary action hierarchy.
 */

import React from 'react';

interface TaskControlsProps {
  isPaused: boolean;
  autoAdvance: boolean;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onToggleAutoAdvance: () => void;
}

export function TaskControls({
  isPaused,
  autoAdvance,
  onPause,
  onResume,
  onComplete,
  onSkip,
  onToggleAutoAdvance,
}: TaskControlsProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Primary action - Done */}
      <button
        onClick={onComplete}
        className="w-full px-6 py-4 bg-calm-primary text-white rounded-xl font-semibold text-lg hover:bg-calm-primary/90 transition-colors"
      >
        Done
      </button>

      {/* Secondary actions - row */}
      <div className="flex gap-3">
        {/* Pause/Resume */}
        {isPaused ? (
          <button
            onClick={onResume}
            className="flex-1 px-4 py-3 bg-calm-surface border border-calm-border text-calm-text rounded-lg font-medium hover:bg-calm-surface-hover transition-colors"
          >
            Resume
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex-1 px-4 py-3 bg-calm-surface border border-calm-border text-calm-text rounded-lg font-medium hover:bg-calm-surface-hover transition-colors"
          >
            Pause
          </button>
        )}

        {/* Skip */}
        <button
          onClick={onSkip}
          className="flex-1 px-4 py-3 bg-calm-surface border border-calm-border text-calm-text rounded-lg font-medium hover:bg-calm-surface-hover transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Tertiary action - auto-advance toggle */}
      <button
        onClick={onToggleAutoAdvance}
        className="w-full px-4 py-2 text-sm text-calm-muted hover:text-calm-text transition-colors"
      >
        {autoAdvance ? '⏭️ Auto-advance: ON' : '⏸️ Auto-advance: OFF'}
      </button>
    </div>
  );
}
