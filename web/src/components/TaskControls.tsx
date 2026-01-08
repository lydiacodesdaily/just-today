/**
 * TaskControls.tsx
 * Control buttons for active task with primary/secondary/tertiary action hierarchy.
 */

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
      {/* Primary action - Done - Touch-friendly 44x44px minimum */}
      <button
        onClick={onComplete}
        className="w-full min-h-[52px] px-6 py-4 bg-calm-primary text-white rounded-xl font-semibold text-lg hover:bg-calm-primary/90 transition-colors touch-manipulation"
        aria-label="Mark task as done"
      >
        Done
      </button>

      {/* Secondary actions - row - Touch-friendly 44x44px minimum */}
      <div className="flex gap-3">
        {/* Pause/Resume */}
        {isPaused ? (
          <button
            onClick={onResume}
            className="flex-1 min-h-[48px] px-4 py-3 bg-calm-surface border border-calm-border text-calm-text rounded-lg font-medium hover:bg-calm-surface-hover transition-colors touch-manipulation"
            aria-label="Resume task"
          >
            Resume
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex-1 min-h-[48px] px-4 py-3 bg-calm-surface border border-calm-border text-calm-text rounded-lg font-medium hover:bg-calm-surface-hover transition-colors touch-manipulation"
            aria-label="Pause task"
          >
            Pause
          </button>
        )}

        {/* Skip */}
        <button
          onClick={onSkip}
          className="flex-1 min-h-[48px] px-4 py-3 bg-calm-surface border border-calm-border text-calm-text rounded-lg font-medium hover:bg-calm-surface-hover transition-colors touch-manipulation"
          aria-label="Skip task"
        >
          Skip
        </button>
      </div>

      {/* Tertiary action - auto-advance toggle - Touch-friendly 44x44px minimum */}
      <button
        onClick={onToggleAutoAdvance}
        className="w-full min-h-[44px] px-4 py-3 text-sm text-calm-muted hover:text-calm-text transition-colors touch-manipulation"
        aria-label={autoAdvance ? 'Turn off auto-advance' : 'Turn on auto-advance'}
      >
        {autoAdvance ? '⏭️ Auto-advance: ON' : '⏸️ Auto-advance: OFF'}
      </button>
    </div>
  );
}
