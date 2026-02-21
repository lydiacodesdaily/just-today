/**
 * CheckInModal.tsx
 * Modal for capturing check-in moments — mood chip + optional note.
 * Used on the Today page (manual) and after routine completion.
 */

'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
import { useCheckInStore } from '@/src/stores/checkInStore';
import { DailyEmotion } from '@/src/models/DailyEntry';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Title override — e.g. "How did that go?" after a routine */
  title?: string;
}

const EMOTION_CHIPS: { label: string; value: DailyEmotion }[] = [
  { label: 'Anxious', value: 'anxious' },
  { label: 'Tired', value: 'tired' },
  { label: 'Overwhelmed', value: 'overwhelmed' },
  { label: 'Stuck', value: 'stuck' },
  { label: 'Good', value: 'good' },
  { label: 'Neutral', value: 'neutral' },
];

export function CheckInModal({ isOpen, onClose, title = "How's it going?" }: CheckInModalProps) {
  const { addItem } = useCheckInStore();
  const [selectedMood, setSelectedMood] = useState<DailyEmotion | null>(null);
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
          {/* Mood chips */}
          <div className="flex flex-wrap gap-2">
            {EMOTION_CHIPS.map((chip) => {
              const isSelected = selectedMood === chip.value;
              return (
                <button
                  key={chip.value}
                  onClick={() => setSelectedMood(isSelected ? null : chip.value)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                    isSelected
                      ? 'bg-calm-primary border-calm-primary text-white'
                      : 'bg-calm-bg border-calm-border text-calm-text hover:border-calm-text/40'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
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
