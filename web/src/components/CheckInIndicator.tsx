/**
 * CheckInIndicator.tsx
 * Small card at the bottom of the Focus tab showing recent check-ins
 * and a quick "+ Check in" entry point.
 */

'use client';

import { useState } from 'react';
import { useCheckInStore } from '@/src/stores/checkInStore';
import { CheckInModal } from './CheckInModal';
import { Pace } from '@/src/models/RoutineTemplate';

const MOOD_COLORS: Record<Pace, string> = {
  low: 'bg-calm-care',
  steady: 'bg-calm-steady',
  flow: 'bg-calm-flow',
};

const MOOD_LABELS: Record<Pace, string> = {
  low: '🌙',
  steady: '🌤',
  flow: '☀️',
};

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function CheckInIndicator() {
  const { getTodayItems } = useCheckInStore();
  const [showModal, setShowModal] = useState(false);

  const todayItems = getTodayItems();
  // Show most recent 2, reversed so newest is first
  const recentItems = [...todayItems].reverse().slice(0, 2);
  const extraCount = todayItems.length - 2;

  return (
    <>
      <div className="bg-calm-surface border border-calm-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-calm-text">Check-ins</span>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-calm-primary hover:text-calm-text transition-colors font-medium"
          >
            + Check in
          </button>
        </div>

        {todayItems.length === 0 ? (
          <p className="text-xs text-calm-muted">No check-ins yet. How's it going?</p>
        ) : (
          <div className="space-y-2">
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-start gap-2.5">
                {item.mood && (
                  <span className="text-sm flex-shrink-0" title={item.mood}>
                    {MOOD_LABELS[item.mood]}
                  </span>
                )}
                {!item.mood && (
                  <div className="w-2 h-2 rounded-full bg-calm-border flex-shrink-0 mt-1" />
                )}
                <div className="flex-1 min-w-0">
                  {item.text ? (
                    <p className="text-xs text-calm-text truncate">{item.text}</p>
                  ) : (
                    <p className="text-xs text-calm-muted italic">
                      Feeling {item.mood ?? 'checked in'}
                    </p>
                  )}
                </div>
                <span className="text-xs text-calm-muted flex-shrink-0">
                  {formatTime(item.createdAt)}
                </span>
              </div>
            ))}
            {extraCount > 0 && (
              <p className="text-xs text-calm-muted">+{extraCount} more today</p>
            )}
          </div>
        )}
      </div>

      <CheckInModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
