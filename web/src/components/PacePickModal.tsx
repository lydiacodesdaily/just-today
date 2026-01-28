/**
 * PacePickModal.tsx
 * Modal for creating and editing Extras
 */

'use client';

import { useState, useEffect } from 'react';
import { usePacePicksStore } from '@/src/stores/pacePicksStore';
import { PacePickItem, PaceTag, EstimatedDuration } from '@/src/models/PacePick';
import { useFocusTrap } from '@/src/hooks/useFocusTrap';

interface PacePickModalProps {
  item?: PacePickItem | null;
  onClose: () => void;
}

// Map internal storage keys to user-facing pace labels
const PACE_OPTIONS: { value: PaceTag; label: string; icon: string }[] = [
  { value: 'low', label: 'Gentle - For days when you need gentleness', icon: '💤' },
  { value: 'steady', label: 'Steady - Your usual pace', icon: '🌿' },
  { value: 'flow', label: 'Deep - When you have extra capacity', icon: '✨' },
];

const DURATIONS: EstimatedDuration[] = ['~5 min', '~10 min', '~15 min', '~25 min'];

export function PacePickModal({ item, onClose }: PacePickModalProps) {
  const { addMenuItem, updateMenuItem } = usePacePicksStore();
  const modalRef = useFocusTrap<HTMLDivElement>(true);
  const isEditing = !!item;

  const [title, setTitle] = useState(item?.title || '');
  const [paceTag, setPaceTag] = useState<PaceTag>(item?.paceTag || 'steady');
  const [duration, setDuration] = useState<EstimatedDuration | ''>(item?.estimatedDuration || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (isEditing && item) {
      updateMenuItem(item.id, {
        title: title.trim(),
        paceTag,
        estimatedDuration: duration || undefined,
      });
    } else {
      addMenuItem(title.trim(), paceTag, duration || undefined);
    }

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
      aria-labelledby="pace-modal-title"
      aria-describedby="pace-modal-description"
    >
      <div
        ref={modalRef}
        className="bg-calm-surface border border-calm-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-calm-border">
          <h2 id="pace-modal-title" className="text-2xl font-semibold text-calm-text">
            {isEditing ? 'Edit Pace Pick' : 'Create Pace Pick'}
          </h2>
          <p id="pace-modal-description" className="text-sm text-calm-muted mt-1">
            Optional things you can add to Today based on your pace
          </p>
        </div>

        {/* Form */}
        <form id="pace-pick-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-calm-text mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Take a short walk, Read for 10 minutes"
              className={`w-full px-4 py-2 bg-calm-bg border rounded-lg text-calm-text placeholder:text-calm-muted/50 focus:outline-none focus:ring-2 focus:ring-calm-primary focus:border-transparent ${
                error ? 'border-red-500' : 'border-calm-border'
              }`}
              autoFocus
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          {/* Pace Select */}
          <div>
            <label htmlFor="paceTag" className="block text-sm font-medium text-calm-text mb-2">
              Pace
            </label>
            <div className="space-y-2">
              {PACE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`
                    flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                    ${
                      paceTag === option.value
                        ? 'bg-calm-primary/10 border-calm-primary'
                        : 'bg-calm-bg border-calm-border hover:border-calm-text/30'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="paceTag"
                    value={option.value}
                    checked={paceTag === option.value}
                    onChange={(e) => setPaceTag(e.target.value as PaceTag)}
                    className="sr-only"
                  />
                  <span className="text-xl">{option.icon}</span>
                  <span className="text-sm text-calm-text">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Select */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-calm-text mb-2">
              Estimated Duration <span className="text-calm-muted text-xs">(optional)</span>
            </label>
            <p className="text-xs text-calm-muted mb-2">
              Rough estimate is fine — you can always adjust when you start
            </p>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value as EstimatedDuration | '')}
              className="w-full px-4 py-2 bg-calm-bg border border-calm-border rounded-lg text-calm-text focus:outline-none focus:ring-2 focus:ring-calm-primary focus:border-transparent"
            >
              <option value="">None</option>
              {DURATIONS.map((dur) => (
                <option key={dur} value={dur}>
                  {dur}
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
            form="pace-pick-form"
            className="flex-1 min-h-[48px] px-4 py-3 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium touch-manipulation"
          >
            {isEditing ? 'Save Changes' : 'Create Pick'}
          </button>
        </div>
      </div>
    </div>
  );
}
