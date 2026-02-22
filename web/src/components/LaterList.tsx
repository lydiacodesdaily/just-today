/**
 * LaterList.tsx
 * Collapsible component for displaying and managing Later items
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { FocusItem, TimeBucket, formatReminderDate, formatTimeBucket, formatCheckOnceDate } from '@/src/models/FocusItem';
import { useFocusStore } from '@/src/stores/focusStore';
import { useWeeklyIntentStore } from '@/src/stores/weeklyIntentStore';
import { useProjectsStore } from '@/src/stores/projectsStore';
import { EditLaterItemModal } from './EditLaterItemModal';
import { CheckOncePicker } from './CheckOncePicker';
import { useCheckOnce } from '@/src/hooks/useCheckOnce';
import { SectionLabel } from './SectionLabel';

interface LaterItemCardProps {
  item: FocusItem;
  projectName?: string;
  onEdit: () => void;
  onMoveToToday: () => void;
  onDelete: () => void;
  onSetTimeBucket: (bucket: TimeBucket) => void;
  onCheckOnceLater: () => void;
  isOnWeeklyPlan?: boolean;
}

function LaterItemCard({ item, projectName, onEdit, onMoveToToday, onDelete, onSetTimeBucket, onCheckOnceLater, isOnWeeklyPlan }: LaterItemCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showTimeBucketMenu, setShowTimeBucketMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeBucketMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowMoreMenu(false);
      }
      if (timeBucketMenuRef.current && !timeBucketMenuRef.current.contains(event.target as Node)) {
        setShowTimeBucketMenu(false);
      }
    }

    if (showMenu || showMoreMenu || showTimeBucketMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu, showMoreMenu, showTimeBucketMenu]);

  // Show encouraging message for items rolled over many times
  const showRolloverEncouragement = item.rolloverCount && item.rolloverCount >= 3;

  return (
    <div className="space-y-2">
      {showRolloverEncouragement && (
        <div className="bg-calm-steady/10 border border-calm-steady/30 rounded-lg p-3">
          <p className="text-xs text-calm-text">
            Carried over {item.rolloverCount} times — no pressure, work with your energy.
            <button
              onClick={onDelete}
              className="ml-1 text-calm-steady hover:underline"
            >
              Let this go?
            </button>
          </p>
        </div>
      )}
      <div className="bg-calm-surface border border-calm-border rounded-lg p-4 hover:border-calm-text/30 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-calm-text mb-1">{item.title}</h3>
            <div className="flex items-center gap-3 text-sm text-calm-muted flex-wrap">
              <span>{item.estimatedDuration}</span>
              {item.timeBucket && item.timeBucket !== 'NONE' && (
                <>
                  <span>•</span>
                  <span className="text-calm-text/70">{formatTimeBucket(item.timeBucket)}</span>
                </>
              )}
              {item.reminderDate && (
                <>
                  <span>•</span>
                  <span>{formatReminderDate(item.reminderDate)}</span>
                </>
              )}
              {item.checkOnceDate && (
                <>
                  <span>•</span>
                  <span className="text-calm-text/70">{formatCheckOnceDate(item.checkOnceDate)}</span>
                </>
              )}
              {item.rolloverCount && item.rolloverCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-calm-steady" title={item.rolloverCount >= 3 ? "No pressure, work with your energy" : undefined}>
                    Rolled over {item.rolloverCount}x
                  </span>
                </>
              )}
              {projectName && (
                <>
                  <span>•</span>
                  <span className="text-calm-primary/70">{projectName}</span>
                </>
              )}
              {isOnWeeklyPlan && (
                <>
                  <span>•</span>
                  <span className="text-calm-primary">This week</span>
                </>
              )}
            </div>
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
                    onMoveToToday();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-calm-text hover:bg-calm-bg transition-colors"
                >
                  ↩ Move to Today
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
                    onEdit();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
                >
                  ✏️ Edit...
                </button>
                <button
                  onClick={() => {
                    setShowTimeBucketMenu(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
                >
                  🗓 When to think about this?
                </button>
                <button
                  onClick={() => {
                    onCheckOnceLater();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors group"
                >
                  <div>🔄 {item.checkOnceDate ? 'Change check date...' : 'Check once later...'}</div>
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

            {showTimeBucketMenu && (
              <div ref={timeBucketMenuRef} className="absolute right-0 top-full mt-1 w-56 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-4 py-2 text-xs text-calm-muted border-b border-calm-border">
                  No reminders, no pressure
                </div>
                {(['TOMORROW', 'THIS_WEEKEND', 'NEXT_WEEK', 'LATER_THIS_MONTH', 'SOMEDAY'] as TimeBucket[]).map((bucket) => (
                  <button
                    key={bucket}
                    onClick={() => {
                      onSetTimeBucket(bucket);
                      setShowTimeBucketMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
                  >
                    {formatTimeBucket(bucket)}
                  </button>
                ))}
                <button
                  onClick={() => {
                    onSetTimeBucket('NONE');
                    setShowTimeBucketMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-calm-muted hover:bg-calm-bg transition-colors border-t border-calm-border"
                >
                  None (clear)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LaterListProps {
  defaultExpanded?: boolean;
}

export function LaterList({ defaultExpanded = false }: LaterListProps) {
  const { laterItems, moveToToday, deleteItem, setItemTimeBucket, setCheckOnce, triggerCheckOnce } = useFocusStore();
  const { getActiveIntent } = useWeeklyIntentStore();
  const { projects } = useProjectsStore();
  const activeIntent = getActiveIntent();
  const weeklySelectedIds = new Set(
    activeIntent?.items.filter((i) => i.outcome === 'pending').map((i) => i.focusItemId) ?? []
  );
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isCheckOnExpanded, setIsCheckOnExpanded] = useState(defaultExpanded);
  const [editingItem, setEditingItem] = useState<FocusItem | null>(null);
  const [checkOnceItemId, setCheckOnceItemId] = useState<string | null>(null);

  const incompleteItems = laterItems.filter((item) => !item.completedAt);
  const { scheduled, due, none } = useCheckOnce(incompleteItems);

  // Trigger check once for due items (mark as triggered on first render when due)
  useEffect(() => {
    due.forEach((item) => {
      if (!item.checkOnceTriggeredAt) {
        triggerCheckOnce(item.id);
      }
    });
  }, [due, triggerCheckOnce]);

  const handleCheckOnceLater = (itemId: string) => {
    setCheckOnceItemId(itemId);
  };

  const handleCheckOnceConfirm = (checkOnceDate: string) => {
    if (checkOnceItemId) {
      setCheckOnce(checkOnceItemId, checkOnceDate);
      setCheckOnceItemId(null);
    }
  };

  const hasCheckOnItems = due.length > 0 || scheduled.length > 0;
  const totalLaterItems = none.length;

  if (incompleteItems.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      {/* Check On Section */}
      {hasCheckOnItems && (
        <>
          <button
            onClick={() => setIsCheckOnExpanded(!isCheckOnExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-calm-surface/50 rounded-lg transition-colors"
            aria-expanded={isCheckOnExpanded}
          >
            <SectionLabel>Check on</SectionLabel>

            <div className="flex items-center gap-2">
              {!isCheckOnExpanded && due.length > 0 && (
                <span className="w-1.5 h-1.5 bg-calm-muted rounded-full" title="Items ready to check" />
              )}
              {!isCheckOnExpanded && (scheduled.length + due.length) > 0 && (
                <span className="text-[11px] text-calm-muted">
                  {scheduled.length + due.length}
                </span>
              )}
              <svg
                className={`w-3 h-3 text-calm-muted transition-transform ${
                  isCheckOnExpanded ? 'transform rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isCheckOnExpanded && (
            <div className="space-y-3 pl-0">
              {due.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-calm-muted px-2">Ready to check</p>
                  {due.map((item) => (
                    <LaterItemCard
                      key={item.id}
                      item={item}
                      projectName={item.projectId ? projects.find((p) => p.id === item.projectId)?.name : undefined}
                      onEdit={() => setEditingItem(item)}
                      onMoveToToday={() => moveToToday(item.id)}
                      onDelete={() => deleteItem(item.id)}
                      onSetTimeBucket={(bucket) => setItemTimeBucket(item.id, bucket)}
                      onCheckOnceLater={() => handleCheckOnceLater(item.id)}
                      isOnWeeklyPlan={weeklySelectedIds.has(item.id)}
                    />
                  ))}
                </div>
              )}
              {scheduled.length > 0 && (
                <div className="space-y-2">
                  {due.length > 0 && <div className="border-t border-calm-border my-3" />}
                  <p className="text-xs text-calm-muted px-2">Scheduled</p>
                  {scheduled.map((item) => (
                    <LaterItemCard
                      key={item.id}
                      item={item}
                      projectName={item.projectId ? projects.find((p) => p.id === item.projectId)?.name : undefined}
                      onEdit={() => setEditingItem(item)}
                      onMoveToToday={() => moveToToday(item.id)}
                      onDelete={() => deleteItem(item.id)}
                      onSetTimeBucket={(bucket) => setItemTimeBucket(item.id, bucket)}
                      onCheckOnceLater={() => handleCheckOnceLater(item.id)}
                      isOnWeeklyPlan={weeklySelectedIds.has(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Later Section */}
      {totalLaterItems > 0 && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-calm-surface/50 rounded-lg transition-colors"
            aria-expanded={isExpanded}
          >
            <SectionLabel>Later</SectionLabel>

            <div className="flex items-center gap-2">
              {!isExpanded && totalLaterItems > 0 && (
                <span className="text-[11px] text-calm-muted">
                  {totalLaterItems}
                </span>
              )}
              <svg
                className={`w-3 h-3 text-calm-muted transition-transform ${
                  isExpanded ? 'transform rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isExpanded && (
            <div className="space-y-3 pl-0">
              {none.map((item) => (
                <LaterItemCard
                  key={item.id}
                  item={item}
                  projectName={item.projectId ? projects.find((p) => p.id === item.projectId)?.name : undefined}
                  onEdit={() => setEditingItem(item)}
                  onMoveToToday={() => moveToToday(item.id)}
                  onDelete={() => deleteItem(item.id)}
                  onSetTimeBucket={(bucket) => setItemTimeBucket(item.id, bucket)}
                  onCheckOnceLater={() => handleCheckOnceLater(item.id)}
                  isOnWeeklyPlan={weeklySelectedIds.has(item.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Check Once Picker */}
      {checkOnceItemId && (
        <CheckOncePicker
          onConfirm={handleCheckOnceConfirm}
          onCancel={() => setCheckOnceItemId(null)}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <EditLaterItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </section>
  );
}
