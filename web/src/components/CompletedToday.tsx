/**
 * CompletedToday.tsx
 * Component showing completed tasks and routine completions for the day
 * Evidence of daily effort - calm and minimal
 */

'use client';

import { useState } from 'react';
import { useFocusStore } from '@/src/stores/focusStore';
import { CompletedTodayEntry } from '@/src/models/CompletedTodayEntry';

interface CompletedEntryCardProps {
  entry: CompletedTodayEntry;
  onUndo?: () => void;
}

function CompletedEntryCard({ entry, onUndo }: CompletedEntryCardProps) {
  const completedTime = new Date(entry.completedAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <svg
          className="w-4 h-4 text-calm-muted flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className={`text-sm ${entry.type === 'routine' ? 'text-calm-muted' : 'text-calm-text/70'} line-through truncate`}>
          {entry.title}
        </span>
        <span className="text-xs text-calm-muted flex-shrink-0">{completedTime}</span>
      </div>

      {onUndo && entry.type === 'task' && (
        <button
          onClick={onUndo}
          className="text-xs text-calm-muted hover:text-calm-text transition-colors flex-shrink-0"
        >
          Undo
        </button>
      )}
    </div>
  );
}

export function CompletedToday() {
  const { completedToday, undoComplete } = useFocusStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (completedToday.length === 0) {
    return null;
  }

  // Separate tasks and routines for optional grouping
  const completedTasks = completedToday.filter((e) => e.type === 'task');
  const completedRoutines = completedToday.filter((e) => e.type === 'routine');
  const hasMultipleTypes = completedTasks.length > 0 && completedRoutines.length > 0;

  // Show simple list if small, grouped if large
  const showGrouping = hasMultipleTypes && completedToday.length > 5;

  return (
    <section className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-calm-surface border border-calm-border rounded-lg hover:border-calm-text/30 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-calm-text">Completed Today</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-calm-border text-calm-text text-sm rounded-full">
            {completedToday.length}
          </span>
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
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="bg-calm-surface border border-calm-border rounded-lg px-4 py-2">
          {showGrouping ? (
            // Grouped view
            <div className="space-y-4">
              {completedTasks.length > 0 && (
                <div>
                  <p className="text-xs text-calm-muted uppercase tracking-wide mb-2">Tasks</p>
                  <div className="space-y-1">
                    {completedTasks.map((entry) => (
                      <CompletedEntryCard
                        key={entry.id}
                        entry={entry}
                        onUndo={() => undoComplete(entry.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {completedRoutines.length > 0 && (
                <div>
                  <p className="text-xs text-calm-muted uppercase tracking-wide mb-2">Routines</p>
                  <div className="space-y-1">
                    {completedRoutines.map((entry) => (
                      <CompletedEntryCard
                        key={entry.id}
                        entry={entry}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Simple list view
            <div className="space-y-1">
              {completedToday.map((entry) => (
                <CompletedEntryCard
                  key={entry.id}
                  entry={entry}
                  onUndo={entry.type === 'task' ? () => undoComplete(entry.id) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
