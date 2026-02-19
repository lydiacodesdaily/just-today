/**
 * CheckInModal.tsx
 * Modal for capturing check-in moments — mood + optional note.
 * Used on the Today page (manual) and after routine completion.
 */

'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
import { useCheckInStore } from '@/src/stores/checkInStore';
import { Pace } from '@/src/models/RoutineTemplate';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Title override — e.g. "How did that go?" after a routine */
  title?: string;
}

const MOOD_OPTIONS: { value: Pace; label: string; emoji: string; description: string }[] = [
  { value: 'low', label: 'Low', emoji: '🌙', description: 'Drained or struggling' },
  { value: 'steady', label: 'Okay', emoji: '🌤', description: 'Getting through it' },
  { value: 'flow', label: 'Flow', emoji: '☀️', description: 'In the zone' },
];

export function CheckInModal({ isOpen, onClose, title = "How's it going?" }: CheckInModalProps) {
  const { addItem } = useCheckInStore();
  const [selectedMood, setSelectedMood] = useState<Pace | null>(null);
  const [note, setNote] = useState('');

  const canSave = selectedMood !== null || note.trim().length > 0;

  const handleSave = () => {
    addItem(note.trim(), selectedMood ?? undefined);
    handleClose();
  };

  const handleClose = () => {
    setSelectedMood(null);
    setNote('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <ModalHeader title={title} />

      <ModalBody>
        <div className="space-y-5">
          {/* Mood selector */}
          <div>
            <p className="text-sm text-calm-muted mb-3">How's your energy?</p>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map((option) => {
                const isSelected = selectedMood === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedMood(isSelected ? null : option.value)}
                    className={`flex-1 flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-calm-primary bg-calm-primary/10 text-calm-text'
                        : 'border-calm-border bg-calm-bg hover:border-calm-text/30 text-calm-muted'
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-xs font-semibold">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional note */}
          <div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSave) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="Add a note... (optional)"
              className="w-full px-3 py-2.5 bg-calm-bg border border-calm-border rounded-lg text-sm text-calm-text placeholder-calm-muted focus:outline-none focus:border-calm-primary/50 transition-colors"
            />
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="justify-between">
        <button
          onClick={handleClose}
          className="text-sm text-calm-muted hover:text-calm-text transition-colors"
        >
          Skip
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-4 py-2 bg-calm-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save check-in
        </button>
      </ModalFooter>
    </Modal>
  );
}
