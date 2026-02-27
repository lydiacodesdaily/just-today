/**
 * TodayCheckIn.tsx
 * Regulation-first check-in card for the Today page (Section 1).
 *
 * cardState drives one transient state:
 *  'default'  — show form (no check-ins) or summary (check-ins exist), derived from live store
 *  'response' — just saved with heavy emotional tone → show calm validation message
 *
 * Empty vs filled is derived from todayItems.length, not from cardState,
 * so it stays correct after Zustand localStorage hydration.
 */

'use client';

import { useState, useEffect } from 'react';
import { useCheckInStore } from '@/src/stores/checkInStore';
import { CheckInModal } from './CheckInModal';
import { DailyEmotion } from '@/src/models/DailyEntry';

// 'default' = derive empty/filled from live store data; 'response' = transient post-save message
type CardState = 'default' | 'response';
type EmotionalTone = 'heavy' | 'light';

const EMOTION_CHIPS: { label: string; value: DailyEmotion }[] = [
  { label: 'Anxious', value: 'anxious' },
  { label: 'Tired', value: 'tired' },
  { label: 'Overwhelmed', value: 'overwhelmed' },
  { label: 'Stuck', value: 'stuck' },
  { label: 'Good', value: 'good' },
  { label: 'Neutral', value: 'neutral' },
];

const MOOD_LABELS: Record<DailyEmotion, string> = {
  anxious: '😰',
  tired: '😴',
  overwhelmed: '😵',
  stuck: '🫠',
  good: '🙂',
  neutral: '😐',
};

const HEAVY_EMOTIONS: DailyEmotion[] = ['anxious', 'tired', 'overwhelmed', 'stuck'];

const HEAVY_KEYWORDS = [
  'anxious', 'tired', 'overwhelmed', 'stuck', 'hard', 'difficult',
  'stressed', 'exhausted', 'panic', 'terrible', 'awful', 'heavy',
  "can't", 'cannot', 'struggling', 'rough',
];

const HEAVY_RESPONSES_MORNING = [
  "That sounds like a heavy morning.\nLet's make today smaller.",
  "It's okay to start slow.\nEven tiny steps count.",
  "A heavy start doesn't set the tone for the whole day.",
];

const HEAVY_RESPONSES_AFTERNOON = [
  "That sounds like a heavy afternoon.\nYou don't have to do it all today.",
  "Sounds like a lot to carry.\nOne thing at a time.",
  "It's okay to pause.\nEven a small reset helps.",
];

const HEAVY_RESPONSES_EVENING = [
  "That was a lot to carry.\nYou made it through.",
  "A heavy day deserves a gentle evening.",
  "You don't have to resolve everything tonight.\nRest is part of the work.",
];

function detectTone(text: string, emotion?: DailyEmotion): EmotionalTone {
  if (emotion && HEAVY_EMOTIONS.includes(emotion)) return 'heavy';
  if (text && HEAVY_KEYWORDS.some((w) => text.toLowerCase().includes(w))) return 'heavy';
  return 'light';
}

function pickResponse(): string {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const index = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hour = now.getHours();
  const pool = hour < 12
    ? HEAVY_RESPONSES_MORNING
    : hour < 18
      ? HEAVY_RESPONSES_AFTERNOON
      : HEAVY_RESPONSES_EVENING;
  return pool[index % pool.length];
}

export function TodayCheckIn() {
  const { getTodayItems, addItem } = useCheckInStore();
  const todayItems = getTodayItems();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [cardState, setCardState] = useState<CardState>('default');
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState<DailyEmotion | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const canSave = text.trim().length > 0 || selectedMood !== null;

  const handleSave = () => {
    const trimmedText = text.trim();
    addItem(trimmedText, selectedMood ?? undefined);

    const tone = detectTone(trimmedText, selectedMood ?? undefined);
    if (tone === 'heavy') {
      setResponseMessage(pickResponse());
      setCardState('response');
    }
    // light tone: stay 'default' — todayItems will now have the new item, showing filled view

    setText('');
    setSelectedMood(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSave) {
      e.preventDefault();
      handleSave();
    }
  };

  const toggleMood = (mood: DailyEmotion) => {
    setSelectedMood((prev) => (prev === mood ? null : mood));
  };

  if (!mounted) {
    return (
      <div className="bg-calm-surface/50 border border-calm-border/50 rounded-2xl p-5 h-[152px]" />
    );
  }

  // Most recent check-in for filled state
  const latestItem = [...todayItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  return (
    <>
      <div className="bg-calm-surface/50 border border-calm-border/50 rounded-2xl p-5">
        {cardState === 'default' && todayItems.length === 0 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-calm-text">How is it going right now?</p>
              <p className="text-xs text-calm-muted mt-0.5">A quick note helps you remember later.</p>
            </div>

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's going on right now?"
              autoComplete="off"
              className="w-full px-3 py-2.5 bg-calm-bg border border-calm-border/60 rounded-lg text-sm text-calm-text placeholder-calm-muted focus:outline-none focus:border-calm-primary/40 transition-colors"
            />

            <div className="flex flex-wrap gap-2">
              {EMOTION_CHIPS.map((chip) => {
                const isSelected = selectedMood === chip.value;
                return (
                  <button
                    key={chip.value}
                    onClick={() => toggleMood(chip.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-calm-primary border-calm-primary text-white'
                        : 'bg-calm-bg border-calm-border text-calm-muted hover:text-calm-text hover:border-calm-text/30'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="px-4 py-1.5 bg-calm-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Check in
              </button>
            </div>
          </div>
        )}

        {cardState === 'response' && (
          <div className="py-2 text-center space-y-4">
            <p className="text-sm text-calm-muted leading-relaxed whitespace-pre-line">
              {responseMessage}
            </p>
            <button
              onClick={() => setCardState('default')}
              className="text-xs text-calm-primary hover:text-calm-text transition-colors font-medium"
            >
              Got it
            </button>
          </div>
        )}

        {cardState === 'default' && todayItems.length > 0 && latestItem && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {latestItem.mood && (
                <span className="text-base flex-shrink-0" aria-label={latestItem.mood}>
                  {MOOD_LABELS[latestItem.mood]}
                </span>
              )}
              <p className="text-sm text-calm-muted flex-1 truncate">
                {latestItem.text
                  ? latestItem.text
                  : `Feeling ${latestItem.mood ?? 'checked in'}`}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-calm-muted/70">
                {new Date(latestItem.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
              <button
                onClick={() => setShowUpdateModal(true)}
                className="text-xs text-calm-primary hover:text-calm-text transition-colors font-medium"
              >
                Check in again
              </button>
            </div>
          </div>
        )}
      </div>

      <CheckInModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="How is it going right now?"
      />
    </>
  );
}
