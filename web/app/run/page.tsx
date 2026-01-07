'use client';

/**
 * run/page.tsx
 * Active routine run execution page.
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRunStore } from '@/src/stores/runStore';
import { useTimer } from '@/src/hooks/useTimer';
import { useTaskTransition } from '@/src/hooks/useTaskTransition';
import { TimeDisplay } from '@/src/components/TimeDisplay';
import { TaskControls } from '@/src/components/TaskControls';
import { SubtaskList } from '@/src/components/SubtaskList';

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

  // Track which runs we've already started to prevent double-start in React Strict Mode
  const startedRunIds = useRef(new Set<string>());

  // Redirect if no run
  useEffect(() => {
    if (!currentRun) {
      router.push('/today');
    }
  }, [currentRun, router]);

  // Auto-start run if not started
  useEffect(() => {
    if (currentRun && currentRun.status === 'notStarted' && !startedRunIds.current.has(currentRun.id)) {
      console.log('[RunPage] Auto-starting run:', currentRun.id, 'status:', currentRun.status);
      startedRunIds.current.add(currentRun.id);
      startCurrentRun();
    }
  }, [currentRun, startCurrentRun]); // Only run when a new run is loaded

  // Handle completion
  useEffect(() => {
    if (currentRun?.status === 'completed') {
      // Show completion message
      setTimeout(() => {
        setCurrentRun(null);
        router.push('/today');
      }, 2000);
    } else if (currentRun?.status === 'abandoned') {
      // Show abandon message
      setTimeout(() => {
        setCurrentRun(null);
        router.push('/today');
      }, 2000);
    }
  }, [currentRun?.status, setCurrentRun, router]);

  // Calculate active task and timer state
  const activeTask = currentRun?.tasks.find((t) => t.id === currentRun.activeTaskId);
  const isPaused = currentRun?.status === 'paused';
  const timeRemaining = useTimer(activeTask || null, isPaused || false, currentRun?.pausedAt);

  // Auto-advance when timer reaches 0 (only for tasks with autoAdvance enabled)
  useTaskTransition({
    activeTask: activeTask || null,
    timeRemaining,
    isPaused,
    currentRun,
    onAdvanceTask: advanceTask,
  });

  if (!currentRun || !activeTask) {
    return null;
  }

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
    if (confirm("End this routine? You can come back to it anytime.")) {
      endCurrentRun();
    }
  };

  const pendingTasks = currentRun.tasks.filter((t) => t.status === 'pending');
  const completedCount = currentRun.tasks.filter((t) => t.status === 'completed').length;
  const totalCount = currentRun.tasks.length;

  // Completion state
  if (currentRun.status === 'completed') {
    return (
      <div className="min-h-screen bg-calm-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-calm-text mb-4">You did it!</h1>
          <p className="text-lg text-calm-muted">Great job completing your routine.</p>
        </div>
      </div>
    );
  }

  // Abandoned state
  if (currentRun.status === 'abandoned') {
    return (
      <div className="min-h-screen bg-calm-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-calm-text mb-4">Routine Ended</h1>
          <p className="text-lg text-calm-muted">That's okay. You can try again whenever you're ready.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            className="text-sm text-calm-muted hover:text-calm-text transition-colors"
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
              {activeTask.autoAdvance && (
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

          {/* Time adjustments */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleExtend(-5 * 60 * 1000)}
              className="px-3 py-2 text-sm text-calm-muted hover:text-calm-text hover:bg-calm-surface rounded-lg transition-colors"
            >
              -5m
            </button>
            <button
              onClick={() => handleExtend(-1 * 60 * 1000)}
              className="px-3 py-2 text-sm text-calm-muted hover:text-calm-text hover:bg-calm-surface rounded-lg transition-colors"
            >
              -1m
            </button>
            <button
              onClick={() => handleExtend(1 * 60 * 1000)}
              className="px-3 py-2 text-sm text-calm-muted hover:text-calm-text hover:bg-calm-surface rounded-lg transition-colors"
            >
              +1m
            </button>
            <button
              onClick={() => handleExtend(5 * 60 * 1000)}
              className="px-3 py-2 text-sm text-calm-muted hover:text-calm-text hover:bg-calm-surface rounded-lg transition-colors"
            >
              +5m
            </button>
          </div>

          {/* Controls */}
          <div className="flex justify-center">
            <TaskControls
              isPaused={isPaused}
              autoAdvance={activeTask.autoAdvance ?? false}
              onPause={pauseCurrentRun}
              onResume={resumeCurrentRun}
              onComplete={handleComplete}
              onSkip={handleSkip}
              onToggleAutoAdvance={handleToggleAutoAdvance}
            />
          </div>

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
    </div>
  );
}
