/**
 * PacePicks.tsx
 * Collapsible component for displaying pace-specific optional items (Extras)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PaceTag } from '@/src/models/PacePick';
import { usePacePicksStore } from '@/src/stores/pacePicksStore';
import { SectionLabel } from './SectionLabel';

interface PacePicksProps {
  paceTag: PaceTag;
}

export function PacePicks({ paceTag }: PacePicksProps) {
  const { menuItems, addToToday } = usePacePicksStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter menu items for current pace
  const filteredItems = menuItems
    .filter((item) => item.paceTag === paceTag)
    .slice(0, 5); // Show max 5 items

  // Show placeholder if no items for this pace
  const hasNoItems = filteredItems.length === 0;

  // Map internal storage keys to user-facing pace labels
  const getPaceLabel = () => {
    switch (paceTag) {
      case 'low':
        return 'Gentle';
      case 'steady':
        return 'Steady';
      case 'flow':
        return 'Deep';
    }
  };

  return (
    <section className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-calm-surface/50 rounded-lg transition-colors"
        aria-expanded={isExpanded}
      >
        <SectionLabel>Optional ({getPaceLabel()})</SectionLabel>

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
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-3">
          {hasNoItems ? (
            <div className="bg-calm-surface/50 border border-dashed border-calm-border rounded-lg p-6 text-center">
              <p className="text-sm text-calm-muted mb-3">
                No Pace Picks for {getPaceLabel()} pace yet.
              </p>
              <Link
                href="/extras"
                className="inline-block px-4 py-2 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                Create Pace Picks →
              </Link>
            </div>
          ) : (
            <>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-calm-surface border border-calm-border rounded-lg p-4 hover:border-calm-text/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-calm-text mb-0.5">{item.title}</h3>
                      {item.estimatedDuration && (
                        <p className="text-sm text-calm-muted">{item.estimatedDuration}</p>
                      )}
                    </div>

                    <button
                      onClick={() => addToToday(item)}
                      className="px-3 py-1.5 bg-calm-border text-calm-text rounded-lg hover:bg-calm-primary hover:text-white dark:hover:text-calm-bg transition-colors text-sm font-medium"
                      title="Add to Today"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}

              {/* Manage link */}
              <Link
                href="/extras"
                className="block text-center text-sm text-calm-muted hover:text-calm-text transition-colors py-2"
              >
                Manage Pace Picks →
              </Link>
            </>
          )}
        </div>
      )}
    </section>
  );
}
