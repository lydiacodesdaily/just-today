'use client';

import { useState } from 'react';
import { useWeeklyIntentStore } from '@/src/stores/weeklyIntentStore';
import { generateReviewSummary } from '@/src/models/WeeklyIntent';

interface WeeklyReviewProps {
  intentId: string;
  onFinalize: () => void;
}

export function WeeklyReview({ intentId, onFinalize }: WeeklyReviewProps) {
  const { intents, setItemOutcome, rollItemToNextWeek, finalizeReview } = useWeeklyIntentStore();
  const [reviewNote, setReviewNote] = useState('');
  const [copied, setCopied] = useState(false);

  const intent = intents.find((i) => i.id === intentId);
  if (!intent) return null;

  const completedItems = intent.items.filter((i) => i.outcome === 'completed');
  const pendingItems = intent.items.filter((i) => i.outcome === 'pending');
  const rolledOverItems = intent.items.filter((i) => i.outcome === 'rolled-over');
  const returnedItems = intent.items.filter((i) => i.outcome === 'returned-to-later');

  const handleFinalize = () => {
    finalizeReview(intentId, reviewNote || undefined);
    onFinalize();
  };

  const handleCopyReview = async () => {
    // Temporarily set the review note for summary generation
    const intentWithNote = { ...intent, reviewNote: reviewNote || undefined };
    const summary = generateReviewSummary(intentWithNote);
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Completed items */}
      {completedItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-3">
            Completed ({completedItems.length})
          </h3>
          <div className="space-y-2">
            {completedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg p-3"
              >
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-calm-text">{item.titleSnapshot}</span>
                {item.isPriority && (
                  <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending items — need decisions */}
      {pendingItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-calm-text mb-3">
            Needs a decision ({pendingItems.length})
          </h3>
          <div className="space-y-2">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="bg-calm-surface border border-calm-border rounded-lg p-3"
              >
                <div className="flex items-center gap-3 mb-3">
                  {item.isPriority && (
                    <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                  <span className="text-sm text-calm-text">{item.titleSnapshot}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => rollItemToNextWeek(intentId, item.id)}
                    className="flex-1 px-3 py-2 bg-calm-bg border border-calm-border rounded-lg text-xs text-calm-text hover:border-calm-text/30 transition-colors"
                  >
                    Carry to next week
                  </button>
                  <button
                    onClick={() => setItemOutcome(intentId, item.id, 'returned-to-later')}
                    className="flex-1 px-3 py-2 bg-calm-bg border border-calm-border rounded-lg text-xs text-calm-muted hover:text-calm-text hover:border-calm-text/30 transition-colors"
                  >
                    Back to Later
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Already decided items */}
      {rolledOverItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-calm-muted mb-2">Carrying forward</h3>
          <div className="space-y-1">
            {rolledOverItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm text-calm-muted px-3 py-2">
                <span>→</span>
                <span>{item.titleSnapshot}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {returnedItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-calm-muted mb-2">Back to Later</h3>
          <div className="space-y-1">
            {returnedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm text-calm-muted px-3 py-2">
                <span>~</span>
                <span>{item.titleSnapshot}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reflection */}
      <div>
        <label className="block text-sm font-medium text-calm-text mb-2">
          Any reflections? <span className="text-calm-muted font-normal">(optional)</span>
        </label>
        <textarea
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          placeholder="How did the week go?"
          rows={3}
          className="w-full bg-calm-bg border border-calm-border rounded-lg px-3 py-2 text-calm-text placeholder-calm-muted focus:outline-none focus:ring-2 focus:ring-calm-primary text-sm resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-calm-border">
        <button
          onClick={handleFinalize}
          disabled={pendingItems.length > 0}
          className="flex-1 px-4 py-3 bg-calm-primary text-white rounded-lg text-sm font-medium hover:bg-calm-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={pendingItems.length > 0 ? 'Decide on all pending items first' : ''}
        >
          {pendingItems.length > 0
            ? `Decide on ${pendingItems.length} item${pendingItems.length > 1 ? 's' : ''} first`
            : 'Finish review'}
        </button>
        <button
          onClick={handleCopyReview}
          className="px-4 py-3 bg-calm-surface border border-calm-border rounded-lg text-sm text-calm-text hover:border-calm-text/30 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy review'}
        </button>
      </div>
    </div>
  );
}
