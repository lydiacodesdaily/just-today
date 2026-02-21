/**
 * FirstEntryModal.tsx
 * Daily first-entry check-in modal. Appears once per day as a calm
 * nervous-system reset entry point — not productivity-oriented.
 *
 * Two internal states:
 *  - 'input'    : free-form text + emotion chip selection
 *  - 'response' : calm validation message (only shown for heavy emotional tone)
 */

'use client';

import { useState } from 'react';
import { Modal, ModalBody } from './Modal';
import { useDailyEntryStore } from '@/src/stores/dailyEntryStore';
import { useCheckInStore } from '@/src/stores/checkInStore';
import { DailyEmotion } from '@/src/models/DailyEntry';

interface FirstEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = 'input' | 'response';
type EmotionalTone = 'heavy' | 'light';

const EMOTION_CHIPS: { label: string; value: DailyEmotion }[] = [
  { label: 'Anxious', value: 'anxious' },
  { label: 'Tired', value: 'tired' },
  { label: 'Overwhelmed', value: 'overwhelmed' },
  { label: 'Stuck', value: 'stuck' },
  { label: 'Good', value: 'good' },
  { label: 'Neutral', value: 'neutral' },
];

const HEAVY_EMOTIONS: DailyEmotion[] = ['anxious', 'tired', 'overwhelmed', 'stuck'];

const HEAVY_KEYWORDS = [
  'anxious', 'tired', 'overwhelmed', 'stuck', 'hard', 'difficult',
  'stressed', 'exhausted', 'panic', 'terrible', 'awful', 'heavy',
  "can't", 'cannot', 'struggling', 'rough',
];

const HEAVY_RESPONSES = [
  "That sounds like a heavy morning.\nLet's make today smaller.",
  "Sounds like a lot to carry.\nYou don't have to do it all today.",
  "It's okay to start slow.\nEven tiny steps count.",
];

function detectTone(text: string, emotion?: DailyEmotion): EmotionalTone {
  if (emotion && HEAVY_EMOTIONS.includes(emotion)) return 'heavy';
  if (text && HEAVY_KEYWORDS.some((w) => text.toLowerCase().includes(w))) {
    return 'heavy';
  }
  return 'light';
}

function pickResponse(): string {
  const today = new Date().toISOString().split('T')[0];
  const index = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return HEAVY_RESPONSES[index % HEAVY_RESPONSES.length];
}

export function FirstEntryModal({ isOpen, onClose }: FirstEntryModalProps) {
  const { saveEntry, dismissForToday } = useDailyEntryStore();
  const { addItem } = useCheckInStore();

  const [modalState, setModalState] = useState<ModalState>('input');
  const [selectedEmotion, setSelectedEmotion] = useState<DailyEmotion | null>(null);
  const [text, setText] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSave = () => {
    const trimmedText = text.trim();
    saveEntry(trimmedText, selectedEmotion ?? undefined);
    addItem(trimmedText, selectedEmotion ?? undefined);

    const tone = detectTone(trimmedText, selectedEmotion ?? undefined);
    if (tone === 'heavy') {
      setResponseMessage(pickResponse());
      setModalState('response');
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    dismissForToday();
    handleClose();
  };

  const handleClose = () => {
    setModalState('input');
    setSelectedEmotion(null);
    setText('');
    setResponseMessage('');
    onClose();
  };

  const toggleEmotion = (emotion: DailyEmotion) => {
    setSelectedEmotion((prev) => (prev === emotion ? null : emotion));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} maxWidth="sm">
      <ModalBody>
        {modalState === 'input' ? (
          <div className="space-y-5 py-1">
            {/* Title */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-calm-text leading-snug">
                What's going on right now?
              </h2>
              <p className="text-sm text-calm-muted mt-1.5">
                You don't have to plan yet. Just get it out.
              </p>
            </div>

            {/* Text input */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind..."
              rows={4}
              autoFocus
              className="w-full px-3 py-3 bg-calm-bg border border-calm-border rounded-lg text-sm text-calm-text placeholder-calm-muted focus:outline-none focus:border-calm-primary/50 transition-colors resize-none"
            />

            {/* Emotion chips */}
            <div className="flex flex-wrap gap-2">
              {EMOTION_CHIPS.map((chip) => {
                const isSelected = selectedEmotion === chip.value;
                return (
                  <button
                    key={chip.value}
                    onClick={() => toggleEmotion(chip.value)}
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

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleSave}
                className="w-full py-3 bg-calm-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Save and Continue
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-2 text-sm text-calm-muted hover:text-calm-text transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        ) : (
          /* Response screen */
          <div className="space-y-6 py-4 text-center">
            <p className="text-lg font-medium text-calm-text leading-relaxed whitespace-pre-line">
              {responseMessage}
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleClose}
                className="w-full py-3 bg-calm-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Pick one tiny thing
              </button>
              <button
                onClick={handleClose}
                className="w-full py-2 text-sm text-calm-muted hover:text-calm-text transition-colors"
              >
                Just sit for a minute
              </button>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
