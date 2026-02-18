'use client';

import { useState, useEffect } from 'react';
import { useWeeklyIntentStore } from '@/src/stores/weeklyIntentStore';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { WeeklyPlanning } from '@/src/components/WeeklyPlanning';
import { WeeklyReview } from '@/src/components/WeeklyReview';
import { isWeekOver, PLANNING_DAY_LABELS, generatePlanSummary } from '@/src/models/WeeklyIntent';
import type { PlanningDay } from '@/src/models/WeeklyIntent';

export default function WeeklyPage() {
  const { intents, startPlanning, getActiveIntent, syncCompletions } = useWeeklyIntentStore();
  const { settings } = useSettingsStore();
  const [copied, setCopied] = useState(false);

  const activeIntent = getActiveIntent();

  // Sync completions on page load
  useEffect(() => {
    syncCompletions();
  }, [syncCompletions]);

  // Determine which view to show
  const showReview = activeIntent?.status === 'active' && isWeekOver(activeIntent);
  const showPlanning = activeIntent?.status === 'planning';
  const showActiveSummary = activeIntent?.status === 'active' && !isWeekOver(activeIntent);

  const handleStartPlanning = () => {
    startPlanning();
  };

  const handleCopyPlan = async () => {
    if (!activeIntent) return;
    const summary = generatePlanSummary(activeIntent);
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Past reviewed intents (most recent first)
  const pastIntents = intents.filter((i) => i.status === 'reviewed').slice(0, 4);

  const formatWeekRange = (start: string, end: string) => {
    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}–${endDay}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
  };

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-calm-text mb-2">This Week</h1>
          <p className="text-calm-muted">Your weekly intentions and review</p>
        </header>

        <div className="space-y-8">
          {/* Review mode */}
          {showReview && activeIntent && (
            <section className="bg-calm-surface border border-calm-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-calm-text mb-1">
                Week in Review
              </h2>
              <p className="text-sm text-calm-muted mb-6">
                {formatWeekRange(activeIntent.weekStartDate, activeIntent.weekEndDate)}
              </p>
              <WeeklyReview intentId={activeIntent.id} onFinalize={() => {}} />
            </section>
          )}

          {/* Planning mode */}
          {showPlanning && activeIntent && (
            <section className="bg-calm-surface border border-calm-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-calm-text mb-1">
                Plan Your Week
              </h2>
              <p className="text-sm text-calm-muted mb-6">
                {formatWeekRange(activeIntent.weekStartDate, activeIntent.weekEndDate)}
              </p>
              <WeeklyPlanning intentId={activeIntent.id} onFinalize={() => {}} />
            </section>
          )}

          {/* Active summary */}
          {showActiveSummary && activeIntent && (
            <section className="bg-calm-surface border border-calm-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-calm-text">
                    This Week's Intent
                  </h2>
                  <p className="text-sm text-calm-muted">
                    {formatWeekRange(activeIntent.weekStartDate, activeIntent.weekEndDate)}
                  </p>
                </div>
                <button
                  onClick={handleCopyPlan}
                  className="px-4 py-2 bg-calm-bg border border-calm-border rounded-lg text-sm text-calm-text hover:border-calm-text/30 transition-colors"
                >
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>

              <div className="space-y-2">
                {activeIntent.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-lg p-3 ${
                      item.outcome === 'completed'
                        ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30'
                        : 'bg-calm-bg border border-calm-border'
                    }`}
                  >
                    {item.outcome === 'completed' ? (
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 border-2 border-calm-border rounded-full flex-shrink-0" />
                    )}
                    <span className={`text-sm ${item.outcome === 'completed' ? 'text-calm-muted line-through' : 'text-calm-text'}`}>
                      {item.titleSnapshot}
                    </span>
                    {item.isPriority && (
                      <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No intent — start planning */}
          {!activeIntent && (
            <section className="bg-calm-surface border border-calm-border rounded-lg p-8 text-center">
              <h2 className="text-xl font-semibold text-calm-text mb-2">No weekly plan yet</h2>
              <p className="text-sm text-calm-muted mb-6">
                Pick a few things to focus on this week and share with friends for accountability.
              </p>
              <button
                onClick={handleStartPlanning}
                className="px-6 py-3 bg-calm-primary text-white rounded-lg text-sm font-medium hover:bg-calm-primary/90 transition-colors"
              >
                Start planning
              </button>
            </section>
          )}

          {/* Past weeks */}
          {pastIntents.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-calm-text mb-4">Past weeks</h2>
              <div className="space-y-3">
                {pastIntents.map((intent) => {
                  const completed = intent.items.filter((i) => i.outcome === 'completed').length;
                  const total = intent.items.length;
                  return (
                    <div
                      key={intent.id}
                      className="bg-calm-surface border border-calm-border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-calm-text">
                            {formatWeekRange(intent.weekStartDate, intent.weekEndDate)}
                          </p>
                          <p className="text-xs text-calm-muted mt-0.5">
                            {completed}/{total} completed
                          </p>
                        </div>
                        {intent.reviewNote && (
                          <p className="text-xs text-calm-muted italic max-w-xs truncate">
                            "{intent.reviewNote}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div className="h-24 md:h-0"></div>
      </div>
    </div>
  );
}
