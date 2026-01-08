/**
 * EditLaterItemModal.tsx
 * Modal for editing Later items
 */

'use client';

import { useState, useEffect } from 'react';
import { useFocusStore } from '@/src/stores/focusStore';
import { FocusItem, FocusDuration, TimeBucket } from '@/src/models/FocusItem';

interface EditLaterItemModalProps {
  item: FocusItem;
  onClose: () => void;
}

const DURATIONS: FocusDuration[] = [
  '~5 min',
  '~10 min',
  '~15 min',
  '~25 min',
  '~30 min',
  '~45 min',
  '~1 hour',
  '~2 hours',
];

const TIME_BUCKETS: { value: TimeBucket; label: string }[] = [
  { value: 'NONE', label: 'None (clear)' },
  { value: 'TOMORROW', label: 'Tomorrow' },
  { value: 'THIS_WEEKEND', label: 'This Weekend' },
  { value: 'NEXT_WEEK', label: 'Next Week' },
  { value: 'LATER_THIS_MONTH', label: 'Later This Month' },
  { value: 'SOMEDAY', label: 'Someday' },
];

export function EditLaterItemModal({ item, onClose }: EditLaterItemModalProps) {
  const { updateLaterItem } = useFocusStore();

  const [title, setTitle] = useState(item.title);
  const [duration, setDuration] = useState<FocusDuration>(item.estimatedDuration);
  const [timeBucket, setTimeBucket] = useState<TimeBucket | undefined>(item.timeBucket);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    updateLaterItem(item.id, title.trim(), duration, timeBucket === 'NONE' ? undefined : timeBucket);
    onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-calm-surface border border-calm-border rounded-xl max-w-lg w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-calm-text">Edit Later Item</h2>
          <p className="text-sm text-calm-muted mt-1">
            Update the task details and when to think about it
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-calm-text mb-2">
              Task
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-2 bg-calm-bg border border-calm-border rounded-lg text-calm-text placeholder:text-calm-muted/50 focus:outline-none focus:ring-2 focus:ring-calm-text/30 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Duration Select */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-calm-text mb-2">
              Estimated Duration
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value as FocusDuration)}
              className="w-full px-4 py-2 bg-calm-bg border border-calm-border rounded-lg text-calm-text focus:outline-none focus:ring-2 focus:ring-calm-text/30 focus:border-transparent"
            >
              {DURATIONS.map((dur) => (
                <option key={dur} value={dur}>
                  {dur}
                </option>
              ))}
            </select>
          </div>

          {/* Time Bucket Select */}
          <div>
            <label htmlFor="timeBucket" className="block text-sm font-medium text-calm-text mb-2">
              When to think about this? <span className="text-calm-muted text-xs">(optional)</span>
            </label>
            <select
              id="timeBucket"
              value={timeBucket || 'NONE'}
              onChange={(e) => setTimeBucket(e.target.value as TimeBucket)}
              className="w-full px-4 py-2 bg-calm-bg border border-calm-border rounded-lg text-calm-text focus:outline-none focus:ring-2 focus:ring-calm-text/30 focus:border-transparent"
            >
              {TIME_BUCKETS.map((bucket) => (
                <option key={bucket.value} value={bucket.value}>
                  {bucket.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-calm-border text-calm-text rounded-lg hover:bg-calm-text/10 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-calm-text text-calm-surface rounded-lg hover:bg-calm-text/90 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
