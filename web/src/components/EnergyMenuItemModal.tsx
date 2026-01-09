/**
 * EnergyMenuItemModal.tsx
 * Modal for creating and editing Energy Menu items
 */

'use client';

import { useState, useEffect } from 'react';
import { useEnergyMenuStore } from '@/src/stores/energyMenuStore';
import { EnergyMenuItem, EnergyLevel, EstimatedDuration } from '@/src/models/EnergyMenuItem';
import { useFocusTrap } from '@/src/hooks/useFocusTrap';

interface EnergyMenuItemModalProps {
  item?: EnergyMenuItem | null;
  onClose: () => void;
}

const ENERGY_LEVELS: { value: EnergyLevel; label: string; icon: string }[] = [
  { value: 'low', label: 'Low - Just the essentials', icon: '💤' },
  { value: 'steady', label: 'Steady - Your usual pace', icon: '🌱' },
  { value: 'flow', label: 'Flow - Feeling good today', icon: '🔥' },
];

const DURATIONS: EstimatedDuration[] = ['~5 min', '~10 min', '~15 min', '~25 min'];

export function EnergyMenuItemModal({ item, onClose }: EnergyMenuItemModalProps) {
  const { addMenuItem, updateMenuItem } = useEnergyMenuStore();
  const modalRef = useFocusTrap<HTMLDivElement>(true);
  const isEditing = !!item;

  const [title, setTitle] = useState(item?.title || '');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(item?.energyLevel || 'steady');
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
        energyLevel,
        estimatedDuration: duration || undefined,
      });
    } else {
      addMenuItem(title.trim(), energyLevel, duration || undefined);
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
      aria-labelledby="energy-modal-title"
      aria-describedby="energy-modal-description"
    >
      <div
        ref={modalRef}
        className="bg-calm-surface border border-calm-border rounded-xl max-w-lg w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 id="energy-modal-title" className="text-2xl font-semibold text-calm-text">
            {isEditing ? 'Edit Energy Menu Item' : 'Create Energy Menu Item'}
          </h2>
          <p id="energy-modal-description" className="text-sm text-calm-muted mt-1">
            Optional tasks you can add to Today based on your energy level
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Energy Level Select */}
          <div>
            <label htmlFor="energyLevel" className="block text-sm font-medium text-calm-text mb-2">
              Energy Level
            </label>
            <div className="space-y-2">
              {ENERGY_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={`
                    flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                    ${
                      energyLevel === level.value
                        ? 'bg-calm-primary/10 border-calm-primary'
                        : 'bg-calm-bg border-calm-border hover:border-calm-text/30'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="energyLevel"
                    value={level.value}
                    checked={energyLevel === level.value}
                    onChange={(e) => setEnergyLevel(e.target.value as EnergyLevel)}
                    className="sr-only"
                  />
                  <span className="text-xl">{level.icon}</span>
                  <span className="text-sm text-calm-text">{level.label}</span>
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

          {/* Actions - Touch-friendly 44px minimum */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[48px] px-4 py-3 bg-calm-border text-calm-text rounded-lg hover:bg-calm-text/10 transition-colors font-medium touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[48px] px-4 py-3 bg-calm-text text-calm-bg rounded-lg hover:bg-calm-text/90 transition-colors font-medium touch-manipulation"
            >
              {isEditing ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
