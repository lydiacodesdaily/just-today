/**
 * LaterList.tsx
 * Collapsible component for displaying and managing Later items
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { FocusItem, TimeBucket, formatReminderDate, formatTimeBucket } from '@/src/models/FocusItem';
import { useFocusStore } from '@/src/stores/focusStore';
import { EditLaterItemModal } from './EditLaterItemModal';

interface LaterItemCardProps {
  item: FocusItem;
  onEdit: () => void;
  onMoveToToday: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onSetTimeBucket: (bucket: TimeBucket) => void;
}

function LaterItemCard({ item, onEdit, onMoveToToday, onComplete, onDelete, onSetTimeBucket }: LaterItemCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showTimeBucketMenu, setShowTimeBucketMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeBucketMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (timeBucketMenuRef.current && !timeBucketMenuRef.current.contains(event.target as Node)) {
        setShowTimeBucketMenu(false);
      }
    }

    if (showMenu || showTimeBucketMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu, showTimeBucketMenu]);

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
            {item.rolloverCount && item.rolloverCount > 0 && (
              <>
                <span>•</span>
                <span className="text-calm-steady" title={item.rolloverCount >= 3 ? "No pressure, work with your energy" : undefined}>
                  Rolled over {item.rolloverCount}x
                </span>
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

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={() => {
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  onMoveToToday();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
              >
                Move to Today
              </button>
              <button
                onClick={() => {
                  setShowTimeBucketMenu(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
              >
                When to think about this?
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-calm-bg transition-colors group"
              >
                <div>Delete</div>
                <div className="text-xs text-red-600/60 mt-0.5 group-hover:text-red-600/80 transition-colors">
                  Sometimes letting go is the right choice
                </div>
              </button>
            </div>
          )}

          {showTimeBucketMenu && (
            <div ref={timeBucketMenuRef} className="absolute right-0 top-full mt-1 w-56 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-10">
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

export function LaterList() {
  const { laterItems, moveToToday, completeItem, deleteItem, startFocus, setItemTimeBucket } = useFocusStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingItem, setEditingItem] = useState<FocusItem | null>(null);

  const incompleteItems = laterItems.filter((item) => !item.completedAt);

  if (incompleteItems.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-calm-surface border border-calm-border rounded-lg hover:border-calm-text/30 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium text-calm-text">Later</span>
          <span className="px-2 py-0.5 bg-calm-border text-calm-text text-sm rounded-full">
            {incompleteItems.length}
          </span>
        </div>

        <svg
          className={`w-5 h-5 text-calm-muted transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Items list */}
      {isExpanded && (
        <div className="space-y-3 pl-0">
          {incompleteItems.map((item) => (
            <LaterItemCard
              key={item.id}
              item={item}
              onEdit={() => setEditingItem(item)}
              onMoveToToday={() => moveToToday(item.id)}
              onComplete={() => completeItem(item.id)}
              onDelete={() => deleteItem(item.id)}
              onSetTimeBucket={(bucket) => setItemTimeBucket(item.id, bucket)}
            />
          ))}
        </div>
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
