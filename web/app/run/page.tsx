'use client';

/**
 * run/page.tsx
 * Active routine run execution page.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRunStore } from '@/src/stores/runStore';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useTimer } from '@/src/hooks/useTimer';
import { useTaskTransition } from '@/src/hooks/useTaskTransition';
import { useAudio } from '@/src/hooks/useAudio';
import { TimeDisplay } from '@/src/components/TimeDisplay';
import { TaskControls } from '@/src/components/TaskControls';
import { SubtaskList } from '@/src/components/SubtaskList';
import { ConfirmDialog } from '@/src/components/Dialog';

export default function RunPage() {
  const router = useRouter();
  const {
    currentRun,
    setCurrentRun,
    startCurrentRun,
    pauseCurrentRun,
    resumeCurrentRun,
    endCurrentRun,
    advanceTask,
    skipCurrentTask,
    extendCurrentTask,
    toggleTaskSubtask,
    toggleTaskAutoAdvance,
  } = useRunStore();
  const { settings } = useSettingsStore();

  // Track which runs we've already started to prevent double-start in React Strict Mode
  const startedRunIds = useRef(new Set<string>());
  // Track if we're in a completion flow to prevent double redirect
  const isCompletingRef = useRef(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Redirect if no run (but not if we just completed/abandoned - let those handle their own redirect)
  useEffect(() => {
    if (!currentRun && !isCompletingRef.current) {
      router.push('/today');
    }
  }, [currentRun, router]);

  // Auto-start run if not started
  useEffect(() => {
    if (currentRun && currentRun.status === 'notStarted' && !startedRunIds.current.has(currentRun.id)) {
      startedRunIds.current.add(currentRun.id);
      startCurrentRun();
    }
  }, [currentRun, startCurrentRun]); // Only run when a new run is loaded

  // Handle completion
  useEffect(() => {
    if (currentRun?.status === 'completed') {
      // Mark that we're completing to prevent double redirect
      isCompletingRef.current = true;
      // Show completion message
      setTimeout(() => {
        router.push('/today');
        // Clear run after navigation starts to prevent blank screen
        setTimeout(() => {
          setCurrentRun(null);
          isCompletingRef.current = false;
        }, 100);
      }, 2000);
    } else if (currentRun?.status === 'abandoned') {
      // Mark that we're completing to prevent double redirect
      isCompletingRef.current = true;
      // Show abandon message
      setTimeout(() => {
        router.push('/today');
        // Clear run after navigation starts to prevent blank screen
        setTimeout(() => {
          setCurrentRun(null);
          isCompletingRef.current = false;
        }, 100);
      }, 2000);
    }
  }, [currentRun?.status, setCurrentRun, router]);

  // Calculate active task and timer state
  const activeTask = currentRun?.tasks.find((t) => t.id === currentRun.activeTaskId);
  const isPaused = currentRun?.status === 'paused';
  const timeRemaining = useTimer(activeTask || null, isPaused || false, currentRun?.pausedAt);

  // Manage audio (ticking and announcements)
  useAudio({
    activeTask: activeTask || null,
    timeRemaining,
    settings,
    isPaused: isPaused || false,
  });

  // Auto-advance when timer reaches 0 (only for tasks with autoAdvance enabled)
  useTaskTransition({
    activeTask: activeTask || null,
    timeRemaining,
    isPaused,
    currentRun,
    onAdvanceTask: advanceTask,
  });

  // Early return if no run at all
  if (!currentRun) {
    return null;
  }

  const pendingTasks = currentRun.tasks.filter((t) => t.status === 'pending');
  const completedCount = currentRun.tasks.filter((t) => t.status === 'completed').length;
  const totalCount = currentRun.tasks.length;

  // Completion state - check this BEFORE checking for activeTask
  if (currentRun.status === 'completed') {
    const messages = [
      "You did it!",
      "That's one done ✓",
      "Nice work",
      "You showed up today",
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return (
      <div className="min-h-screen bg-calm-bg flex items-center justify-center animate-in fade-in duration-300">
        <div className="text-center px-4 animate-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-bold text-calm-text mb-4">{randomMessage}</h1>
          <p className="text-lg text-calm-muted mb-2">{currentRun.templateName} complete</p>
          <p className="text-base text-calm-muted">
            {completedCount} of {totalCount} {totalCount === 1 ? 'task' : 'tasks'} done
          </p>
        </div>
      </div>
    );
  }

  // Abandoned state
  if (currentRun.status === 'abandoned') {
    return (
      <div className="min-h-screen bg-calm-bg flex items-center justify-center animate-in fade-in duration-300">
        <div className="text-center px-4 animate-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-bold text-calm-text mb-4">Taking a break</h1>
          <p className="text-lg text-calm-muted mb-2">That's part of the process</p>
          <p className="text-base text-calm-muted">
            You can come back to this anytime you're ready
          </p>
        </div>
      </div>
    );
  }

  // If we reach here, we need an active task to render the running UI
  if (!activeTask) {
    return null;
  }

  // Handler functions for the running state
  const handleComplete = () => {
    if (activeTask) {
      advanceTask();
    }
  };

  const handleSkip = () => {
    if (activeTask) {
      skipCurrentTask(activeTask.id);
    }
  };

  const handleToggleAutoAdvance = () => {
    if (activeTask) {
      toggleTaskAutoAdvance(activeTask.id);
    }
  };

  const handleExtend = (deltaMs: number) => {
    if (activeTask) {
      extendCurrentTask(activeTask.id, deltaMs);
    }
  };

  const handleEnd = () => {
    setShowEndConfirm(true);
  };

  const confirmEnd = () => {
    endCurrentRun();
  };

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-sm text-calm-muted mb-1">
              {currentRun.templateName}
            </div>
            <div className="text-lg font-semibold text-calm-text">
              Task {completedCount + 1} of {totalCount}
            </div>
          </div>
          <button
            onClick={handleEnd}
            className="min-h-[44px] px-4 py-2 text-sm text-calm-muted hover:text-calm-text transition-colors touch-manipulation"
            aria-label="End routine"
          >
            End routine
          </button>
        </div>

        {/* Main content */}
        <div className="space-y-8">
          {/* Task card */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-8">
            {/* Task header */}
            <div className="mb-6">
              <p className="text-sm text-calm-muted mb-2">Focus on</p>
              <h1 className="text-3xl font-semibold text-calm-text leading-tight">
                {activeTask.name}
              </h1>
              {isPaused && (
                <div className="mt-4 px-4 py-3 bg-calm-steady/20 border border-calm-steady/40 rounded-lg">
                  <p className="text-sm text-calm-text">
                    Taking a break is part of the process
                  </p>
                </div>
              )}
              {activeTask.autoAdvance && !isPaused && (
                <div className="mt-3">
                  <span className="text-sm text-calm-muted">⏭️ auto-advances</span>
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="py-8">
              <TimeDisplay
                timeRemaining={timeRemaining}
                totalDurationMs={activeTask.durationMs + activeTask.extensionMs}
                originalDurationMs={activeTask.durationMs}
              />
            </div>

            {/* Subtasks */}
            {activeTask.subtasks && activeTask.subtasks.length > 0 && (
              <div className="pt-6 border-t border-calm-border">
                <SubtaskList
                  subtasks={activeTask.subtasks}
                  onToggle={(subtaskId) => toggleTaskSubtask(activeTask.id, subtaskId)}
                />
              </div>
            )}
          </div>

          {/* Time adjustments - Touch-friendly 44x44px minimum */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleExtend(-5 * 60 * 1000)}
              className="min-w-[44px] min-h-[44px] px-4 py-3 text-sm text-calm-muted hover:text-calm-text hover:bg-calm-surface rounded-lg transition-colors touch-manipulation"
              aria-label="Decrease time by 5 minutes"
            >
              -5m
            </button>
            <button
              onClick={() => handleExtend(-1 * 60 * 1000)}
              className="min-w-[44px] min-h-[44px] px-4 py-3 text-sm text-calm-muted hover:text-calm-text hover:bg-calm-surface rounded-lg transition-colors touch-manipulation"
              aria-label="Decrease time by 1 minute"
            >
              -1m
            </button>
            <button
              onClick={() => handleExtend(1 * 60 * 1000)}
              className="min-w-[44px] min-h-[44px] px-4 py-3 text-sm text-calm-muted hover:text-calm-text hover:bg-calm-surface rounded-lg transition-colors touch-manipulation"
              aria-label="Increase time by 1 minute"
            >
              +1m
            </button>
            <button
              onClick={() => handleExtend(5 * 60 * 1000)}
              className="min-w-[44px] min-h-[44px] px-4 py-3 text-sm text-calm-muted hover:text-calm-text hover:bg-calm-surface rounded-lg transition-colors touch-manipulation"
              aria-label="Increase time by 5 minutes"
            >
              +5m
            </button>
          </div>

          {/* Controls */}
          <TaskControls
            isPaused={isPaused}
            autoAdvance={activeTask.autoAdvance ?? false}
            onPause={pauseCurrentRun}
            onResume={resumeCurrentRun}
            onComplete={handleComplete}
            onSkip={handleSkip}
            onToggleAutoAdvance={handleToggleAutoAdvance}
          />

          {/* Queue preview */}
          {pendingTasks.length > 0 && (
            <div className="pt-8 border-t border-calm-border">
              <h3 className="text-sm font-semibold text-calm-muted mb-4">
                Up next ({pendingTasks.length} {pendingTasks.length === 1 ? 'task' : 'tasks'})
              </h3>
              <div className="space-y-2">
                {pendingTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between px-4 py-3 bg-calm-surface/50 rounded-lg"
                  >
                    <span className="text-calm-text">{task.name}</span>
                    <span className="text-sm text-calm-muted">
                      {Math.ceil(task.durationMs / 60000)} min
                    </span>
                  </div>
                ))}
                {pendingTasks.length > 3 && (
                  <div className="text-center text-sm text-calm-muted pt-2">
                    +{pendingTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer spacing */}
        <div className="h-16"></div>
      </div>

      {/* End Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        onConfirm={confirmEnd}
        title="End This Routine?"
        message="You can come back to it anytime from Today."
        confirmLabel="End Routine"
        cancelLabel="Keep Going"
        variant="warning"
      />
    </div>
  );
}
