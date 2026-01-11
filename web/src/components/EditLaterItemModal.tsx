/**
 * EditLaterItemModal.tsx
 * Modal for editing Later items
 */

'use client';

import { useState, useEffect } from 'react';
import { useFocusStore } from '@/src/stores/focusStore';
import { FocusItem, FocusDuration, TimeBucket } from '@/src/models/FocusItem';
import { useFocusTrap } from '@/src/hooks/useFocusTrap';

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
  const modalRef = useFocusTrap<HTMLDivElement>(true);

  const [title, setTitle] = useState(item.title);
  const [duration, setDuration] = useState<FocusDuration>(item.estimatedDuration);
  const [timeBucket, setTimeBucket] = useState<TimeBucket | undefined>(item.timeBucket);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a title');
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
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      aria-describedby="edit-modal-description"
    >
      <div
        ref={modalRef}
        className="bg-calm-surface border border-calm-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-calm-border">
          <h2 id="edit-modal-title" className="text-2xl font-semibold text-calm-text">
            Edit Later Item
          </h2>
          <p id="edit-modal-description" className="text-sm text-calm-muted mt-1">
            Update the task details and when to think about it
          </p>
        </div>

        {/* Form */}
        <form id="edit-later-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-calm-text mb-2">
              Task
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="What needs to be done?"
              className={`w-full px-4 py-2 bg-calm-bg border rounded-lg text-calm-text placeholder:text-calm-muted/50 focus:outline-none focus:ring-2 focus:ring-calm-text/30 focus:border-transparent ${
                error ? 'border-red-500' : 'border-calm-border'
              }`}
              autoFocus
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          {/* Duration Select */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-calm-text mb-2">
              Estimated Duration
            </label>
            <p className="text-xs text-calm-muted mb-2">
              Think about how long this usually takes, then add a little buffer
            </p>
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

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-calm-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[48px] px-4 py-3 bg-calm-border text-calm-text rounded-lg hover:bg-calm-text/10 transition-colors font-medium touch-manipulation"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-later-form"
            className="flex-1 min-h-[48px] px-4 py-3 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium touch-manipulation"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
