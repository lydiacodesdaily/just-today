/**
 * LaterList.tsx
 * Collapsible component for displaying and managing Later items
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { FocusItem, formatReminderDate } from '@/src/models/FocusItem';
import { useFocusStore } from '@/src/stores/focusStore';

interface LaterItemCardProps {
  item: FocusItem;
  onMoveToToday: () => void;
  onComplete: () => void;
  onDelete: () => void;
}

function LaterItemCard({ item, onMoveToToday, onComplete, onDelete }: LaterItemCardProps) {
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
    <div className="bg-calm-surface border border-calm-border rounded-lg p-4 hover:border-calm-text/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-calm-text mb-1">{item.title}</h3>
          <div className="flex items-center gap-3 text-sm text-calm-muted">
            <span>{item.estimatedDuration}</span>
            {item.reminderDate && (
              <>
                <span>•</span>
                <span>{formatReminderDate(item.reminderDate)}</span>
              </>
            )}
            {item.rolloverCount && item.rolloverCount > 0 && (
              <>
                <span>•</span>
                <span className="text-calm-steady">Rolled over {item.rolloverCount}x</span>
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
            <div className="absolute right-0 top-full mt-1 w-48 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-10">
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
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-calm-bg transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LaterList() {
  const { laterItems, moveToToday, completeItem, deleteItem, startFocus } = useFocusStore();
  const [isExpanded, setIsExpanded] = useState(false);

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
              onMoveToToday={() => moveToToday(item.id)}
              onComplete={() => completeItem(item.id)}
              onDelete={() => deleteItem(item.id)}
              onStart={() => startFocus(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
