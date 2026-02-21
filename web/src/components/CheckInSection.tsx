/**
 * CheckInSection.tsx
 * Display section for the Reflections page showing all today's check-ins
 * grouped by time block (Morning / Afternoon / Evening).
 */

'use client';

import { useState } from 'react';
import { useCheckInStore } from '@/src/stores/checkInStore';
import { groupByTimeBlock } from '@/src/utils/checkInGrouping';
import { CheckInModal } from './CheckInModal';
import { DailyEmotion } from '@/src/models/DailyEntry';

const MOOD_LABELS: Record<DailyEmotion, string> = {
  anxious: '😰',
  tired: '😴',
  overwhelmed: '😵',
  stuck: '🫠',
  good: '🙂',
  neutral: '😐',
};

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function CheckInSection() {
  const { getTodayItems } = useCheckInStore();
  const [showModal, setShowModal] = useState(false);

  const todayItems = getTodayItems();
  const groups = groupByTimeBlock(todayItems);

  return (
    <>
      <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-calm-text">Check-ins</h2>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-calm-primary hover:text-calm-text transition-colors font-medium"
          >
            + Check in now
          </button>
        </div>

        {groups.length === 0 ? (
          <p className="text-sm text-calm-muted">
            Check-ins will appear here as you move through your day.
          </p>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.timeBlock}>
                <p className="text-xs font-semibold text-calm-muted uppercase tracking-wide mb-2">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <span className="text-base flex-shrink-0">
                        {item.mood ? MOOD_LABELS[item.mood] : '·'}
                      </span>
                      <div className="flex-1 min-w-0">
                        {item.text ? (
                          <p className="text-sm text-calm-text">{item.text}</p>
                        ) : (
                          <p className="text-sm text-calm-muted italic">
                            Feeling {item.mood ?? 'checked in'}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-calm-muted flex-shrink-0">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CheckInModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
