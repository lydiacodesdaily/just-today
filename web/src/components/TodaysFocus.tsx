/**
 * TodaysFocus.tsx
 * Component for displaying and managing Today's focus items
 */

'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { FocusItem, FocusDuration } from '@/src/models/FocusItem';
import { useFocusStore } from '@/src/stores/focusStore';
import { useRunStore } from '@/src/stores/runStore';
import { usePacePicksStore } from '@/src/stores/pacePicksStore';
import { useProjectsStore } from '@/src/stores/projectsStore';
import { usePaceStore } from '@/src/stores/paceStore';
import { createRunFromFocusItem } from '@/src/engine/runEngine';
import { TodayOptionalItem } from '@/src/models/PacePick';
import { AriaLiveRegion } from '@/src/components/AriaLiveRegion';
import { useFocusTrap } from '@/src/hooks/useFocusTrap';
import { CheckOncePicker } from '@/src/components/CheckOncePicker';
import { SectionLabel } from '@/src/components/SectionLabel';

const DURATION_OPTIONS: FocusDuration[] = [
  '~5 min',
  '~10 min',
  '~15 min',
  '~25 min',
  '~30 min',
  '~45 min',
  '~1 hour',
  '~2 hours',
];

interface TodayItemCardProps {
  item: FocusItem;
  projectName?: string;
  onComplete: () => void;
  onMoveToLater: () => void;
  onDelete: () => void;
  onStart: () => void;
  onCheckOnceLater: () => void;
  isEditing: boolean;
  editingTitle: string;
  editingDuration: FocusDuration | null;
  onEditTitleChange: (text: string) => void;
  onEditDurationChange: (dur: FocusDuration) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditStart: () => void;
}

function TodayItemCard({
  item,
  projectName,
  onComplete,
  onMoveToLater,
  onDelete,
  onStart,
  onCheckOnceLater,
  isEditing,
  editingTitle,
  editingDuration,
  onEditTitleChange,
  onEditDurationChange,
  onEditSave,
  onEditCancel,
  onEditStart,
}: TodayItemCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const canceledByEscapeRef = useRef(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowMoreMenu(false);
      }
    }

    if (showMenu || showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu, showMoreMenu]);

  const activeDuration = editingDuration ?? item.estimatedDuration;

  return (
    <div className="bg-calm-surface border border-calm-border rounded-lg p-4 transition-colors hover:border-calm-text/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onEditSave();
                } else if (e.key === 'Escape') {
                  canceledByEscapeRef.current = true;
                  onEditCancel();
                }
              }}
              onBlur={() => {
                if (!canceledByEscapeRef.current) {
                  onEditSave();
                }
                canceledByEscapeRef.current = false;
              }}
              className="w-full text-base font-medium text-calm-text bg-transparent border-none outline-none p-0 m-0 mb-1"
              autoFocus
            />
          ) : (
            <h3
              className="text-base font-medium text-calm-text mb-1 cursor-text"
              onClick={(e) => {
                e.stopPropagation();
                onEditStart();
              }}
            >
              {item.title}
            </h3>
          )}
          {isEditing ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {DURATION_OPTIONS.map((dur) => (
                <button
                  key={dur}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDurationChange(dur);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    activeDuration === dur
                      ? 'bg-calm-primary/10 border-calm-primary text-calm-primary font-medium'
                      : 'bg-calm-surface border-calm-border text-calm-muted hover:border-calm-text/30'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          ) : (
            <p
              className="text-sm text-calm-muted cursor-pointer hover:text-calm-text/70 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEditStart();
              }}
            >
              {item.estimatedDuration}
              {projectName && (
                <span className="text-calm-primary/70"> · {projectName}</span>
              )}
            </p>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-calm-border/50 rounded-lg transition-colors"
            aria-label="Options"
          >
            <svg
              className="w-5 h-5 text-calm-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {/* Primary actions menu */}
          {showMenu && !showMoreMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={() => {
                  onStart();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-calm-text hover:bg-calm-bg transition-colors"
              >
                ▶ Start
              </button>
              <button
                onClick={() => {
                  onComplete();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-calm-text hover:bg-calm-bg transition-colors"
              >
                ✓ Mark Done
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowMoreMenu(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-calm-muted hover:bg-calm-bg hover:text-calm-text transition-colors border-t border-calm-border"
              >
                More...
              </button>
            </div>
          )}

          {/* Secondary "More" actions menu */}
          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowMenu(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-calm-muted hover:bg-calm-bg transition-colors border-b border-calm-border"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  onEditStart();
                  setShowMoreMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
              >
                ✏️ Edit...
              </button>
              <button
                onClick={() => {
                  onMoveToLater();
                  setShowMoreMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors group"
              >
                <div>⏭ Move to Later</div>
                <div className="text-xs text-calm-muted mt-0.5 group-hover:text-calm-text/70 transition-colors">
                  That&apos;s okay — you can come back when ready
                </div>
              </button>
              <button
                onClick={() => {
                  onCheckOnceLater();
                  setShowMoreMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors group"
              >
                <div>🔄 Check once later...</div>
                <div className="text-xs text-calm-muted mt-0.5 group-hover:text-calm-text/70 transition-colors">
                  Resurface once to close the loop
                </div>
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMoreMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-calm-bg transition-colors group border-t border-calm-border"
              >
                <div>Remove</div>
                <div className="text-xs text-red-600/60 mt-0.5 group-hover:text-red-600/80 transition-colors">
                  Sometimes letting go is the right choice
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

interface OptionalItemCardProps {
  item: TodayOptionalItem;
  onComplete: () => void;
  onRemove: () => void;
  onStart: () => void;
}

function OptionalItemCard({ item, onComplete, onRemove, onStart }: OptionalItemCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div className="bg-calm-surface/60 border border-calm-border border-dashed rounded-lg p-4 hover:border-calm-text/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-calm-muted uppercase tracking-wide">Optional</span>
            <span className="text-xs text-calm-muted/70">• Resets daily</span>
          </div>
          <h3 className="text-base font-medium text-calm-text mb-1">{item.title}</h3>
          {item.estimatedDuration && (
            <p className="text-sm text-calm-muted">{item.estimatedDuration}</p>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-calm-border/50 rounded-lg transition-colors"
            aria-label="Options"
          >
            <svg
              className="w-5 h-5 text-calm-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={() => {
                  onStart();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
              >
                Start Timer
              </button>
              <button
                onClick={() => {
                  onComplete();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
              >
                Mark Done
              </button>
              <button
                onClick={() => {
                  onRemove();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-calm-bg transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export interface TodaysFocusRef {
  openQuickAdd: () => void;
  markCurrentTaskDone: () => void;
}

interface TodaysFocusProps {
  onOpenPacePicks?: () => void;
}

export const TodaysFocus = forwardRef<TodaysFocusRef, TodaysFocusProps>(function TodaysFocus({ onOpenPacePicks }, ref) {
  const {
    todayItems,
    addToToday,
    completeItem,
    moveToLater,
    deleteItem,
    setCheckOnce,
    updateTodayItem,
    rolloverCount,
    dismissRollover,
    completionCelebrationMessage,
  } = useFocusStore();
  const { todayOptionalItems, completeOptionalItem, removeFromToday } = usePacePicksStore();
  const { setCurrentRun } = useRunStore();
  const { projects } = useProjectsStore();
  const currentPace = usePaceStore((state) => state.currentPace);
  const router = useRouter();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const addDropdownRef = useRef<HTMLDivElement>(null);
  const [newTitle, setNewTitle] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<FocusDuration>('~15 min');
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const [checkOnceItemId, setCheckOnceItemId] = useState<string | null>(null);

  // Inline editing state
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditTitle, setInlineEditTitle] = useState('');
  const [inlineEditDuration, setInlineEditDuration] = useState<FocusDuration | null>(null);

  const addModalRef = useFocusTrap<HTMLDivElement>(showAddModal);

  const getPaceLabel = () => {
    switch (currentPace) {
      case 'low': return 'Gentle';
      case 'steady': return 'Steady';
      case 'flow': return 'Deep';
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (addDropdownRef.current && !addDropdownRef.current.contains(e.target as Node)) {
        setShowAddDropdown(false);
      }
    }
    if (showAddDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAddDropdown]);

  // All incomplete today items - show all items (no Show More pattern)
  const incompleteTodayItems = todayItems.filter((item) => !item.completedAt);
  const incompleteOptionalItems = todayOptionalItems.filter((item) => !item.completedAt);
  const hasItems = incompleteTodayItems.length > 0 || incompleteOptionalItems.length > 0;

  // Expose methods for keyboard shortcuts
  useImperativeHandle(ref, () => ({
    openQuickAdd: () => {
      setShowAddModal(true);
    },
    markCurrentTaskDone: () => {
      // Mark the first item as done
      if (incompleteTodayItems.length > 0) {
        completeItem(incompleteTodayItems[0].id);
        setSrAnnouncement(`Task completed: ${incompleteTodayItems[0].title}`);
      } else if (incompleteOptionalItems.length > 0) {
        completeOptionalItem(incompleteOptionalItems[0].id);
        setSrAnnouncement(`Task completed: ${incompleteOptionalItems[0].title}`);
      }
    },
  }));

  const handleAdd = () => {
    if (newTitle.trim()) {
      addToToday(newTitle.trim(), selectedDuration);
      setSrAnnouncement(`Added to today: ${newTitle.trim()}`);
      setNewTitle('');
      setSelectedDuration('~15 min');
      setShowAddModal(false);
    }
  };

  const handleStartFocus = (item: FocusItem) => {
    // Create a run from the focus item
    const run = createRunFromFocusItem(item);
    setCurrentRun(run);
    // Navigate to run page where timer will auto-start
    router.push('/run');
  };

  const handleStartOptional = (item: TodayOptionalItem) => {
    // Convert optional item to FocusItem format
    const focusItem: FocusItem = {
      id: item.id,
      title: item.title,
      estimatedDuration: item.estimatedDuration || '~15 min',
      createdAt: new Date(item.addedAt).toISOString(),
      location: 'today',
    };
    handleStartFocus(focusItem);
  };

  const handleInlineEditStart = (item: FocusItem) => {
    setInlineEditingId(item.id);
    setInlineEditTitle(item.title);
    setInlineEditDuration(null);
  };

  const handleInlineSave = (itemId: string) => {
    const trimmed = inlineEditTitle.trim();
    if (trimmed) {
      const item = incompleteTodayItems.find((i) => i.id === itemId);
      const finalDuration = inlineEditDuration ?? item?.estimatedDuration ?? '~15 min';
      updateTodayItem(itemId, trimmed, finalDuration);
    }
    setInlineEditingId(null);
  };

  const handleInlineCancel = () => {
    setInlineEditingId(null);
  };

  const handleCheckOnceLater = (itemId: string) => {
    setCheckOnceItemId(itemId);
  };

  const handleCheckOnceConfirm = (checkOnceDate: string) => {
    if (checkOnceItemId) {
      // Set the check once date
      setCheckOnce(checkOnceItemId, checkOnceDate);
      // Move item to Later
      moveToLater(checkOnceItemId);
      setCheckOnceItemId(null);
      setSrAnnouncement('Item moved to Later with check date set');
    }
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionLabel>Today&apos;s Focus</SectionLabel>
        <div className="relative" ref={addDropdownRef}>
          <button
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            className="px-3 py-1.5 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-xs flex items-center gap-1"
          >
            + Add
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAddDropdown && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={() => { setShowAddDropdown(false); setShowAddModal(true); }}
                className="w-full px-4 py-2.5 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
              >
                Add a task
              </button>
              {onOpenPacePicks && (
                <button
                  onClick={() => { setShowAddDropdown(false); onOpenPacePicks(); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors border-t border-calm-border"
                >
                  Add from Pace Picks ({getPaceLabel()})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Completion celebration message */}
      {completionCelebrationMessage && (
        <div
          className="bg-calm-flow/20 border border-calm-flow/40 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-calm-text font-medium text-center">
            {completionCelebrationMessage}
          </p>
        </div>
      )}

      {/* Rollover notification */}
      {rolloverCount > 0 && (
        <div
          className="bg-calm-steady/20 border border-calm-steady/40 rounded-lg p-4"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-calm-text">
              {rolloverCount} item{rolloverCount === 1 ? '' : 's'} moved to Later from yesterday.
              That&apos;s okay — you can bring them back when ready.
            </p>
            <button
              onClick={dismissRollover}
              className="text-calm-muted hover:text-calm-text transition-colors"
              aria-label="Dismiss rollover notification"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Today's Items */}
      {hasItems && (
        <div className="space-y-3">
          {incompleteTodayItems.map((item) => (
            <TodayItemCard
              key={item.id}
              item={item}
              projectName={item.projectId ? projects.find((p) => p.id === item.projectId)?.name : undefined}
              onComplete={() => completeItem(item.id)}
              onMoveToLater={() => moveToLater(item.id)}
              onDelete={() => deleteItem(item.id)}
              onStart={() => handleStartFocus(item)}
              onCheckOnceLater={() => handleCheckOnceLater(item.id)}
              isEditing={inlineEditingId === item.id}
              editingTitle={inlineEditTitle}
              editingDuration={inlineEditDuration}
              onEditTitleChange={setInlineEditTitle}
              onEditDurationChange={setInlineEditDuration}
              onEditSave={() => handleInlineSave(item.id)}
              onEditCancel={handleInlineCancel}
              onEditStart={() => handleInlineEditStart(item)}
            />
          ))}

          {/* Optional items from Pace Picks */}
          {incompleteOptionalItems.map((item) => (
            <OptionalItemCard
              key={item.id}
              item={item}
              onComplete={() => completeOptionalItem(item.id)}
              onRemove={() => removeFromToday(item.id)}
              onStart={() => handleStartOptional(item)}
            />
          ))}
        </div>
      )}

      {/* Empty state when no items at all */}
      {!hasItems && (
        <div className="bg-calm-surface border border-calm-border rounded-lg p-8 text-center">
          <p className="text-calm-text mb-2">Nothing planned yet.</p>
          <p className="text-sm text-calm-muted mb-6">
            That's okay. Start small when you're ready.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
          >
            Add your first item
          </button>
        </div>
      )}

      {/* Add item modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-modal-title"
        >
          <div
            ref={addModalRef}
            className="bg-calm-surface border border-calm-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-calm-border">
              <h3 id="add-modal-title" className="text-xl font-semibold text-calm-text">
                Add to Today
              </h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-calm-text mb-2">
                  What do you want to focus on?
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdd();
                    } else if (e.key === 'Escape') {
                      setShowAddModal(false);
                    }
                  }}
                  placeholder="e.g., Review pull requests"
                  className="w-full px-4 py-2 bg-calm-bg border border-calm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-text/30 text-calm-text"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-calm-text mb-2">
                  Estimated duration
                </label>
                <p className="text-xs text-calm-muted mb-2">
                  How long do you think this will take? It&apos;s okay to adjust as you go.
                </p>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value as FocusDuration)}
                  className="w-full px-4 py-2 bg-calm-bg border border-calm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-text/30 text-calm-text"
                >
                  {DURATION_OPTIONS.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-calm-border flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 min-h-[48px] px-4 py-3 bg-calm-border text-calm-text rounded-lg hover:bg-calm-border/80 transition-colors touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                className="flex-1 min-h-[48px] px-4 py-3 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check Once Picker */}
      {checkOnceItemId && (
        <CheckOncePicker
          onConfirm={handleCheckOnceConfirm}
          onCancel={() => setCheckOnceItemId(null)}
        />
      )}

      {/* Screen reader announcements */}
      <AriaLiveRegion message={srAnnouncement} politeness="polite" />
    </section>
  );
});
