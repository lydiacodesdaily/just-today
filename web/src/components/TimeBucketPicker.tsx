/**
 * TimeBucketPicker.tsx
 * Modal component for selecting a time bucket (when to think about something)
 */

'use client';

import { TimeBucket, formatTimeBucket } from '@/src/models/FocusItem';
import { useFocusTrap } from '@/src/hooks/useFocusTrap';

interface TimeBucketPickerProps {
  onConfirm: (timeBucket?: TimeBucket) => void;
  onCancel: () => void;
}

const TIME_BUCKETS: TimeBucket[] = [
  'TOMORROW',
  'THIS_WEEKEND',
  'NEXT_WEEK',
  'LATER_THIS_MONTH',
  'SOMEDAY',
];

export function TimeBucketPicker({ onConfirm, onCancel }: TimeBucketPickerProps) {
  const modalRef = useFocusTrap<HTMLDivElement>(true);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="time-bucket-picker-title"
    >
      <div
        ref={modalRef}
        className="bg-calm-surface border border-calm-border rounded-xl w-full max-w-sm overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-calm-border">
          <h3 id="time-bucket-picker-title" className="text-lg font-semibold text-calm-text">
            When to think about this?
          </h3>
          <p className="text-sm text-calm-muted mt-1">
            No reminders, no pressure — just a soft grouping
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-2">
          {TIME_BUCKETS.map((bucket) => (
            <button
              key={bucket}
              onClick={() => onConfirm(bucket)}
              className="w-full px-4 py-3 text-left text-calm-text hover:bg-calm-bg rounded-lg transition-colors"
            >
              {formatTimeBucket(bucket)}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-calm-border flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 min-h-[44px] px-4 py-2 bg-calm-border text-calm-text rounded-lg hover:bg-calm-border/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm()}
            className="flex-1 min-h-[44px] px-4 py-2 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Skip (no bucket)
          </button>
        </div>
      </div>
    </div>
  );
}
