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
import { CheckInModal } from '@/src/components/CheckInModal';
import { TickingSoundType, MilestoneInterval } from '@/src/models/Settings';

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
  const { settings, updateSettings } = useSettingsStore();

  // Track which runs we've already started to prevent double-start in React Strict Mode
  const startedRunIds = useRef(new Set<string>());
  // Track if we're in a completion flow to prevent double redirect
  const isCompletingRef = useRef(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);

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
      // Show check-in modal after a brief pause
      setTimeout(() => {
        setShowCheckIn(true);
      }, 1000);
    } else if (currentRun?.status === 'abandoned') {
      // Keep the run as abandoned so it can be resumed from the routine card
      isCompletingRef.current = true;
      setTimeout(() => {
        router.push('/today');
        isCompletingRef.current = false;
      }, 1500);
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
    currentRun,
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

    const handleCheckInClose = () => {
      setShowCheckIn(false);
      router.push('/today');
      setTimeout(() => {
        setCurrentRun(null);
        isCompletingRef.current = false;
      }, 100);
    };

    return (
      <div className="min-h-screen bg-calm-bg flex items-center justify-center animate-in fade-in duration-300">
        <div className="text-center px-4 animate-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-bold text-calm-text mb-4">{randomMessage}</h1>
          <p className="text-lg text-calm-muted mb-2">{currentRun.templateName} complete</p>
          <p className="text-base text-calm-muted">
            {completedCount} of {totalCount} {totalCount === 1 ? 'task' : 'tasks'} done
          </p>
        </div>
        <CheckInModal
          isOpen={showCheckIn}
          onClose={handleCheckInClose}
          title="How did that go?"
        />
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
            {completedCount} of {totalCount} {totalCount === 1 ? 'task' : 'tasks'} done
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

              {/* Sound controls row */}
              <div className="flex items-center justify-center gap-2 mt-5">
                <button
                  onClick={() => updateSettings({ soundMuted: !settings.soundMuted })}
                  className="flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg text-sm text-calm-muted hover:text-calm-text hover:bg-calm-bg transition-colors touch-manipulation"
                  aria-label={settings.soundMuted ? 'Unmute sounds' : 'Mute sounds'}
                >
                  {settings.soundMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="1" y1="1" x2="23" y2="23"/>
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  )}
                  <span>{settings.soundMuted ? 'Muted' : 'Sound on'}</span>
                </button>

                <button
                  onClick={() => setShowAudioSettings((v) => !v)}
                  className={`flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg text-sm transition-colors touch-manipulation ${
                    showAudioSettings
                      ? 'text-calm-primary bg-calm-primary/10'
                      : 'text-calm-muted hover:text-calm-text hover:bg-calm-bg'
                  }`}
                  aria-label="Audio settings"
                  aria-expanded={showAudioSettings}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  <span>Audio</span>
                </button>
              </div>

              {/* Expandable audio settings panel */}
              {showAudioSettings && (
                <div className="mt-4 p-4 bg-calm-bg rounded-xl border border-calm-border space-y-5 text-left animate-in slide-in-from-top-2 duration-200">
                  {/* Tick sound style */}
                  <div>
                    <div className="text-xs font-semibold text-calm-muted uppercase tracking-wide mb-2">Tick sound</div>
                    <div className="flex gap-2">
                      {([
                        { value: 'tick2-tok2' as TickingSoundType, label: 'Gentle' },
                        { value: 'tick1-tok1' as TickingSoundType, label: 'Classic' },
                        { value: 'beep' as TickingSoundType, label: 'Beep' },
                      ]).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateSettings({ tickingSoundType: opt.value })}
                          className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                            settings.tickingSoundType === opt.value
                              ? 'bg-calm-primary text-white border-calm-primary'
                              : 'bg-calm-surface text-calm-text border-calm-border hover:border-calm-text/30'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tick volume */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-calm-text">Tick volume</span>
                      <span className="text-xs text-calm-muted">{Math.round(settings.tickingVolume * 100)}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100"
                      value={settings.tickingVolume * 100}
                      onChange={(e) => updateSettings({ tickingVolume: parseInt(e.target.value) / 100 })}
                      className="w-full h-2 bg-calm-border rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Voice volume */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-calm-text">Voice volume</span>
                      <span className="text-xs text-calm-muted">{Math.round(settings.ttsVolume * 100)}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100"
                      value={settings.ttsVolume * 100}
                      onChange={(e) => updateSettings({ ttsVolume: parseInt(e.target.value) / 100 })}
                      className="w-full h-2 bg-calm-border rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {/* Voice interval */}
                  <div>
                    <div className="text-xs font-semibold text-calm-muted uppercase tracking-wide mb-2">Voice every</div>
                    <div className="flex gap-2">
                      {([1, 5, 10] as MilestoneInterval[]).map((interval) => (
                        <button
                          key={interval}
                          onClick={() => updateSettings({
                            milestoneInterval: interval,
                            minuteAnnouncementsEnabled: true,
                          })}
                          className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                            settings.minuteAnnouncementsEnabled && settings.milestoneInterval === interval
                              ? 'bg-calm-primary text-white border-calm-primary'
                              : 'bg-calm-surface text-calm-text border-calm-border hover:border-calm-text/30'
                          }`}
                        >
                          {interval}m
                        </button>
                      ))}
                      <button
                        onClick={() => updateSettings({ minuteAnnouncementsEnabled: false })}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          !settings.minuteAnnouncementsEnabled
                            ? 'bg-calm-primary text-white border-calm-primary'
                            : 'bg-calm-surface text-calm-text border-calm-border hover:border-calm-text/30'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>

                  {/* Final countdown toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-calm-text">Final countdown</div>
                      <div className="text-xs text-calm-muted">Voice at 50, 40, 30, 20, 10…1s</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.countdownEnabled}
                        onChange={() => updateSettings({ countdownEnabled: !settings.countdownEnabled })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-calm-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-calm-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-calm-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-calm-primary"></div>
                    </label>
                  </div>
                </div>
              )}
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
