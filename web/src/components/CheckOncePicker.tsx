/**
 * CheckOncePicker.tsx
 * Calm, non-nagging single resurfacing date picker
 */

'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { calculateCheckOnceDate } from '@/src/models/FocusItem';

interface CheckOncePickerProps {
  onConfirm: (checkOnceDate: string) => void;
  onCancel: () => void;
}

export function CheckOncePicker({ onConfirm, onCancel }: CheckOncePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<'few-days' | 'next-week' | 'two-weeks' | 'custom' | null>(null);
  const [customDate, setCustomDate] = useState('');

  const handleConfirm = () => {
    if (!selectedPreset) return;

    let checkOnceDate: string | null = null;

    if (selectedPreset === 'custom') {
      if (!customDate) return;
      checkOnceDate = calculateCheckOnceDate('custom', new Date(customDate));
    } else {
      checkOnceDate = calculateCheckOnceDate(selectedPreset);
    }

    if (checkOnceDate) {
      onConfirm(checkOnceDate);
    }
  };

  const presetOptions = [
    { value: 'few-days', label: 'In a few days', description: '3 days from now' },
    { value: 'next-week', label: 'Next week', description: '7 days from now' },
    { value: 'two-weeks', label: 'In two weeks', description: '14 days from now' },
    { value: 'custom', label: 'Pick a date', description: 'Choose your own date' },
  ] as const;

  const canConfirm = selectedPreset && (selectedPreset !== 'custom' || customDate);

  return (
    <Modal isOpen={true} onClose={onCancel} maxWidth="lg" position="center">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-calm-border">
        <h3 className="text-lg font-semibold text-calm-text mb-1">
          Check back once
        </h3>
        <p className="text-sm text-calm-muted">
          We'll resurface this once. No reminders.
        </p>
      </div>

      {/* Options */}
      <div className="px-6 py-4 space-y-2">
        {presetOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedPreset(option.value)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              selectedPreset === option.value
                ? 'border-calm-text bg-calm-border'
                : 'border-calm-border hover:border-calm-text/50'
            }`}
          >
            <div className="font-medium text-calm-text">{option.label}</div>
            <div className="text-xs text-calm-muted mt-0.5">{option.description}</div>
          </button>
        ))}

        {/* Custom date picker */}
        {selectedPreset === 'custom' && (
          <div className="pt-2">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 bg-calm-bg border border-calm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-text/30 text-calm-text"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-calm-border flex gap-3 pb-safe">
        <button
          onClick={onCancel}
          className="flex-1 min-h-[48px] px-4 py-3 bg-calm-border text-calm-text rounded-lg hover:bg-calm-border/80 transition-colors touch-manipulation"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="flex-1 min-h-[48px] px-4 py-3 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          Set check
        </button>
      </div>
    </Modal>
  );
}
