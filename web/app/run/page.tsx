'use client';

/**
 * run/page.tsx
 * Active routine run execution page.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRunStore } from '@/src/stores/runStore';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useFocusStore } from '@/src/stores/focusStore';
import { createRunFromFocusItem } from '@/src/engine/runEngine';
import { FocusItem } from '@/src/models/FocusItem';
import { useTimer } from '@/src/hooks/useTimer';
import { useTaskTransition } from '@/src/hooks/useTaskTransition';
import { useAudio } from '@/src/hooks/useAudio';
import { TimeDisplay } from '@/src/components/TimeDisplay';
import { TaskControls } from '@/src/components/TaskControls';
import { SubtaskList } from '@/src/components/SubtaskList';
import { ConfirmDialog } from '@/src/components/Dialog';
import { CheckInModal } from '@/src/components/CheckInModal';
import { TickingSoundType, MilestoneInterval } from '@/src/models/Settings';
import { RunTask } from '@/src/models/RoutineRun';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Only auto-prompt check-in for sessions at or above this duration
const MIN_CHECKIN_DURATION_MS = 45 * 60 * 1000;

// ─── Sortable queue item (used in edit mode) ──────────────────────────────────

interface SortableQueueItemProps {
  task: RunTask;
  isMenuOpen: boolean;
  isEditing: boolean;
  inlineEditName: string;
  inlineEditDuration: number;
  onMenuToggle: (id: string) => void;
  onEdit: (task: RunTask) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditNameChange: (name: string) => void;
  onEditDurationChange: (duration: number) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}

function SortableQueueItem({
  task,
  isMenuOpen,
  isEditing,
  inlineEditName,
  inlineEditDuration,
  onMenuToggle,
  onEdit,
  onEditSave,
  onEditCancel,
  onEditNameChange,
  onEditDurationChange,
  onDuplicate,
  onRemove,
}: SortableQueueItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
      <div className="flex items-center gap-2 px-3 py-2.5 bg-calm-surface/50 rounded-lg">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-calm-muted/40 hover:text-calm-muted/70 transition-colors touch-manipulation cursor-grab active:cursor-grabbing flex-shrink-0"
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="8" cy="5" r="2"/><circle cx="16" cy="5" r="2"/>
            <circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>
            <circle cx="8" cy="19" r="2"/><circle cx="16" cy="19" r="2"/>
          </svg>
        </button>

        {/* Task name */}
        <span className="flex-1 text-calm-text text-sm truncate">{task.name}</span>

        {/* Duration */}
        <span className="text-xs text-calm-muted shrink-0">
          {Math.ceil(task.durationMs / 60000)} min
        </span>

        {/* Three-dot menu */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onMenuToggle(task.id); }}
            className="p-1.5 text-calm-muted hover:text-calm-text rounded transition-colors"
            aria-label="Task options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-1 w-36 bg-calm-surface border border-calm-border rounded-xl shadow-lg z-20 overflow-hidden">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="w-full text-left px-4 py-2.5 text-sm text-calm-text hover:bg-calm-bg transition-colors"
              >
                Edit...
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(task.id); }}
                className="w-full text-left px-4 py-2.5 text-sm text-calm-text hover:bg-calm-bg transition-colors"
              >
                Duplicate
              </button>
              <div className="h-px bg-calm-border" />
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(task.id); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-calm-bg transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline edit form */}
      {isEditing && (
        <div className="mt-1 mb-1 flex items-center gap-2 px-3 py-2 bg-calm-bg border border-calm-primary/30 rounded-lg animate-in slide-in-from-top-1 duration-150">
          <input
            value={inlineEditName}
            onChange={(e) => onEditNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onEditSave();
              if (e.key === 'Escape') onEditCancel();
            }}
            autoFocus
            className="flex-1 bg-transparent text-sm text-calm-text focus:outline-none min-w-0"
            placeholder="Task name"
          />
          <input
            type="number"
            value={inlineEditDuration}
            onChange={(e) => onEditDurationChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-12 text-center bg-calm-surface border border-calm-border rounded text-sm text-calm-text focus:outline-none focus:border-calm-primary px-1 py-0.5"
            min={1}
          />
          <span className="text-xs text-calm-muted shrink-0">min</span>
          <button
            onClick={onEditSave}
            className="text-xs text-calm-primary hover:text-calm-primary/80 transition-colors shrink-0 font-medium"
          >
            Save
          </button>
          <button
            onClick={onEditCancel}
            className="text-xs text-calm-muted hover:text-calm-text transition-colors shrink-0"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

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
    moveCurrentTask,
    toggleTaskSubtask,
    toggleTaskAutoAdvance,
    appendTaskToQueue,
    removeTaskFromQueue,
    updateTaskInQueue,
    duplicateTaskInQueue,
  } = useRunStore();
  const { settings, updateSettings } = useSettingsStore();

  // Track which runs we've already started to prevent double-start in React Strict Mode
  const startedRunIds = useRef(new Set<string>());
  // Track if we're in a completion flow to prevent double redirect
  const isCompletingRef = useRef(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  // Queue edit mode state
  const [isEditingQueue, setIsEditingQueue] = useState(false);
  const [taskMenuOpenId, setTaskMenuOpenId] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditName, setInlineEditName] = useState('');
  const [inlineEditDuration, setInlineEditDuration] = useState(5);
  const [showAddTask, setShowAddTask] = useState(false);
  const [addTaskName, setAddTaskName] = useState('');
  const [addTaskDuration, setAddTaskDuration] = useState(5);

  // dnd-kit sensors for queue reordering
  const queueSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
      // Only auto-prompt check-in for longer sessions
      const sessionDurationMs = currentRun.startedAt ? Date.now() - currentRun.startedAt : 0;
      if (sessionDurationMs >= MIN_CHECKIN_DURATION_MS) {
        setTimeout(() => {
          setShowCheckIn(true);
        }, 1000);
      }
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

  // Close task menu when clicking outside
  useEffect(() => {
    if (!taskMenuOpenId) return;
    const handleClick = () => setTaskMenuOpenId(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [taskMenuOpenId]);

  // Queue drag-and-drop handler
  const handleQueueDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentRun) return;
    const pendingTasks = currentRun.tasks.filter((t) => t.status === 'pending');
    const newIndex = pendingTasks.findIndex((t) => t.id === over.id);
    if (newIndex !== -1) {
      moveCurrentTask(active.id as string, newIndex);
    }
  };

  // Queue edit mode helpers
  const handleInlineEditSave = () => {
    if (inlineEditId && inlineEditName.trim()) {
      updateTaskInQueue(inlineEditId, {
        name: inlineEditName.trim(),
        durationMs: inlineEditDuration * 60 * 1000,
      });
    }
    setInlineEditId(null);
  };

  const handleAddTaskSubmit = () => {
    if (addTaskName.trim()) {
      appendTaskToQueue(addTaskName.trim(), addTaskDuration * 60 * 1000);
      setAddTaskName('');
      setAddTaskDuration(5);
      setShowAddTask(false);
    }
  };

  const handleCloseEditMode = () => {
    setIsEditingQueue(false);
    setTaskMenuOpenId(null);
    setInlineEditId(null);
    setShowAddTask(false);
    setAddTaskName('');
  };

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

    const handleDone = () => {
      setShowCheckIn(false);
      router.push('/today');
      setTimeout(() => {
        setCurrentRun(null);
        isCompletingRef.current = false;
      }, 100);
    };

    const handleStartNextTask = (item: FocusItem) => {
      const newRun = createRunFromFocusItem(item);
      setCurrentRun(newRun);
      isCompletingRef.current = false;
      router.push('/run');
    };

    // Remaining today items (excludes the one we just completed via sourceFocusItemId)
    const remainingTodayItems = useFocusStore.getState().todayItems.filter(
      (i) => !i.completedAt
    );

    return (
      <div className="min-h-screen bg-calm-bg flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="w-full max-w-3xl px-4 md:px-6 lg:px-8">
          {/* Celebration */}
          <div className="text-center mb-8 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-bold text-calm-text mb-4">{randomMessage}</h1>
            <p className="text-lg text-calm-muted mb-2">{currentRun.templateName} complete</p>
            <p className="text-base text-calm-muted">
              {completedCount} of {totalCount} {totalCount === 1 ? 'task' : 'tasks'} done
            </p>
          </div>

          {/* Next tasks */}
          {remainingTodayItems.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-calm-muted mb-3 text-center">What's next?</p>
              <div className="space-y-2">
                {remainingTodayItems.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleStartNextTask(item)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-calm-surface border border-calm-border rounded-xl hover:border-calm-text/30 transition-colors text-left"
                  >
                    <span className="text-calm-text text-sm truncate mr-3">{item.title}</span>
                    <span className="text-xs text-calm-muted shrink-0">{item.estimatedDuration}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowCheckIn(true)}
              className="text-sm text-calm-muted hover:text-calm-text transition-colors"
            >
              Add check-in
            </button>
            <button
              onClick={handleDone}
              className="text-sm text-calm-muted hover:text-calm-text transition-colors"
            >
              {remainingTodayItems.length > 0 ? 'Back to today' : 'Done'}
            </button>
          </div>
        </div>

        <CheckInModal
          isOpen={showCheckIn}
          onClose={handleDone}
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

          {/* Queue section */}
          {(pendingTasks.length > 0 || isEditingQueue) && (
            <div className="pt-8 border-t border-calm-border">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-calm-muted">
                  Up next ({pendingTasks.length} {pendingTasks.length === 1 ? 'task' : 'tasks'})
                </h3>
                {isEditingQueue ? (
                  <button
                    onClick={handleCloseEditMode}
                    className="text-sm text-calm-primary hover:text-calm-primary/80 transition-colors font-medium"
                  >
                    Done editing
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingQueue(true)}
                    className="p-1.5 text-calm-muted hover:text-calm-text transition-colors rounded"
                    aria-label="Edit queue"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                )}
              </div>

              {isEditingQueue ? (
                /* Edit mode — full list with drag handles, actions, add form */
                <>
                  <DndContext
                    sensors={queueSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleQueueDragEnd}
                  >
                    <SortableContext
                      items={pendingTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-1">
                        {pendingTasks.map((task) => (
                          <SortableQueueItem
                            key={task.id}
                            task={task}
                            isMenuOpen={taskMenuOpenId === task.id}
                            isEditing={inlineEditId === task.id}
                            inlineEditName={inlineEditName}
                            inlineEditDuration={inlineEditDuration}
                            onMenuToggle={(id) =>
                              setTaskMenuOpenId((prev) => (prev === id ? null : id))
                            }
                            onEdit={(t) => {
                              setInlineEditId(t.id);
                              setInlineEditName(t.name);
                              setInlineEditDuration(Math.ceil(t.durationMs / 60000));
                              setTaskMenuOpenId(null);
                            }}
                            onEditSave={handleInlineEditSave}
                            onEditCancel={() => setInlineEditId(null)}
                            onEditNameChange={setInlineEditName}
                            onEditDurationChange={setInlineEditDuration}
                            onDuplicate={(id) => {
                              duplicateTaskInQueue(id);
                              setTaskMenuOpenId(null);
                            }}
                            onRemove={(id) => {
                              removeTaskFromQueue(id);
                              setTaskMenuOpenId(null);
                            }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Add task form / button */}
                  {showAddTask ? (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-calm-bg border border-calm-primary/30 rounded-lg animate-in slide-in-from-top-1 duration-150">
                      <input
                        value={addTaskName}
                        onChange={(e) => setAddTaskName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTaskSubmit();
                          if (e.key === 'Escape') {
                            setShowAddTask(false);
                            setAddTaskName('');
                            setAddTaskDuration(5);
                          }
                        }}
                        autoFocus
                        placeholder="Task name..."
                        className="flex-1 bg-transparent text-sm text-calm-text placeholder:text-calm-muted/60 focus:outline-none min-w-0"
                      />
                      <input
                        type="number"
                        value={addTaskDuration}
                        onChange={(e) =>
                          setAddTaskDuration(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-12 text-center bg-calm-surface border border-calm-border rounded text-sm text-calm-text focus:outline-none focus:border-calm-primary px-1 py-0.5"
                        min={1}
                      />
                      <span className="text-xs text-calm-muted shrink-0">min</span>
                      <button
                        onClick={handleAddTaskSubmit}
                        className="text-xs text-calm-primary hover:text-calm-primary/80 transition-colors shrink-0 font-medium"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddTask(false);
                          setAddTaskName('');
                          setAddTaskDuration(5);
                        }}
                        className="text-xs text-calm-muted hover:text-calm-text transition-colors shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddTask(true)}
                      className="mt-3 w-full flex items-center gap-2 px-4 py-2.5 text-sm text-calm-muted hover:text-calm-text hover:bg-calm-surface/50 rounded-lg border border-dashed border-calm-border transition-colors"
                    >
                      <span>+</span>
                      <span>Add task</span>
                    </button>
                  )}
                </>
              ) : (
                /* View mode — first 3 tasks */
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
              )}
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
