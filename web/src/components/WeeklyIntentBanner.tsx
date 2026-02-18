'use client';

import Link from 'next/link';
import { useWeeklyIntentStore } from '@/src/stores/weeklyIntentStore';
import { useSettingsStore } from '@/src/stores/settingsStore';

export function WeeklyIntentBanner() {
  const { settings } = useSettingsStore();
  const { intents, shouldShowPlanningNudge, shouldShowReviewNudge, dismissPlanningNudge, dismissReviewNudge, getActiveIntent } = useWeeklyIntentStore();

  if (!settings.weeklyIntentEnabled) return null;

  const showPlanningNudge = shouldShowPlanningNudge();
  const showReviewNudge = shouldShowReviewNudge();
  const activeIntent = getActiveIntent();

  // Planning nudge
  if (showPlanningNudge) {
    return (
      <div className="bg-calm-surface border border-calm-primary/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-calm-text">It's planning day</p>
            <p className="text-xs text-calm-muted mt-0.5">Set your weekly intentions</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/weekly"
              className="px-4 py-2 bg-calm-primary text-white rounded-lg text-sm font-medium hover:bg-calm-primary/90 transition-colors"
            >
              Plan my week
            </Link>
            <button
              onClick={dismissPlanningNudge}
              className="p-2 text-calm-muted hover:text-calm-text transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Review nudge
  if (showReviewNudge) {
    return (
      <div className="bg-calm-surface border border-calm-primary/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-calm-text">Week's wrapping up</p>
            <p className="text-xs text-calm-muted mt-0.5">Ready to review how it went?</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/weekly"
              className="px-4 py-2 bg-calm-primary text-white rounded-lg text-sm font-medium hover:bg-calm-primary/90 transition-colors"
            >
              Review my week
            </Link>
            <button
              onClick={dismissReviewNudge}
              className="p-2 text-calm-muted hover:text-calm-text transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active intent summary
  if (activeIntent && activeIntent.status === 'active') {
    const completedCount = activeIntent.items.filter((i) => i.outcome === 'completed').length;
    const totalCount = activeIntent.items.length;
    const priorityCount = activeIntent.items.filter((i) => i.isPriority).length;

    return (
      <Link
        href="/weekly"
        className="block bg-calm-surface border border-calm-border rounded-lg p-4 hover:border-calm-text/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-calm-text">This week</p>
            <p className="text-xs text-calm-muted mt-0.5">
              {completedCount}/{totalCount} done
              {priorityCount > 0 && ` · ${priorityCount} priorit${priorityCount === 1 ? 'y' : 'ies'}`}
            </p>
          </div>
          <svg className="w-5 h-5 text-calm-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    );
  }

  return null;
}
