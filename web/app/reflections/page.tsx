'use client';

import { useEffect, useState } from 'react';
import { useSnapshotStore } from '@/src/stores/snapshotStore';
import { DailySnapshot, formatFocusTime } from '@/src/models/DailySnapshot';
import {
  getTodayReflectionMessage,
  getPaceMessage,
  getLaterItemsMessage,
  getClosingMessage,
  getWeeklyReflectionMessage,
  getPaceEmoji,
} from '@/src/utils/reflectionMessages';

export default function ReflectionsPage() {
  const { loadTodaySnapshot, getWeekSnapshots } = useSnapshotStore();
  const [todaySnapshot, setTodaySnapshot] = useState<DailySnapshot | null>(null);
  const [weekSnapshots, setWeekSnapshots] = useState<DailySnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load snapshots on mount
    const today = loadTodaySnapshot();
    const week = getWeekSnapshots(new Date());

    setTodaySnapshot(today);
    setWeekSnapshots(week);
    setIsLoading(false);
  }, [loadTodaySnapshot, getWeekSnapshots]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-calm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-calm-border rounded w-48 mb-2"></div>
            <div className="h-4 bg-calm-border rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-calm-surface rounded-lg"></div>
              <div className="h-64 bg-calm-surface rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasActivity =
    todaySnapshot &&
    (todaySnapshot.focusItemsCompleted > 0 ||
      todaySnapshot.routineRunsCompleted > 0 ||
      todaySnapshot.totalFocusTimeMs > 0);

  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-calm-text mb-2">Reflections</h1>
          <p className="text-calm-muted">What you did today matters.</p>
        </header>

        {/* Two-column layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Story Card */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-calm-text mb-4">
              Today&apos;s Story
            </h2>

            {todaySnapshot && hasActivity ? (
              <div className="space-y-4">
                {/* Activity Summary */}
                <div className="flex flex-wrap gap-4 text-sm text-calm-muted">
                  {todaySnapshot.focusItemsCompleted > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🎯</span>
                      <span>
                        {todaySnapshot.focusItemsCompleted} focus{' '}
                        {todaySnapshot.focusItemsCompleted === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  )}

                  {todaySnapshot.totalFocusTimeMs > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">⏱️</span>
                      <span>{formatFocusTime(todaySnapshot.totalFocusTimeMs)}</span>
                    </div>
                  )}

                  {todaySnapshot.routineRunsCompleted > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">✓</span>
                      <span>
                        {todaySnapshot.routineRunsCompleted} routine{' '}
                        {todaySnapshot.routineRunsCompleted === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  )}

                  {todaySnapshot.pacesSelected.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {todaySnapshot.pacesSelected.map((pace, idx) => (
                        <span key={idx} className="text-base">
                          {getPaceEmoji(pace)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pace Message */}
                {todaySnapshot.pacesSelected.length > 0 && (
                  <p className="text-calm-text leading-relaxed">
                    {getPaceMessage(todaySnapshot.pacesSelected)}
                  </p>
                )}

                {/* Items Moved to Later */}
                {todaySnapshot.itemsMovedToLater > 0 && (
                  <p className="text-sm text-calm-muted">
                    {getLaterItemsMessage(todaySnapshot.itemsMovedToLater)}
                  </p>
                )}

                {/* Main Reflection Message */}
                <p className="text-lg text-calm-text font-medium leading-relaxed pt-2">
                  {getTodayReflectionMessage(todaySnapshot)}
                </p>

                {/* Closing Message */}
                <p className="text-calm-muted italic pt-2">{getClosingMessage()}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-calm-text leading-relaxed">
                  {todaySnapshot
                    ? getTodayReflectionMessage(todaySnapshot)
                    : "You're here. That matters."}
                </p>
                <p className="text-calm-muted italic">
                  Some days are about just being.
                </p>
              </div>
            )}
          </div>

          {/* This Week Card */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-calm-text mb-4">This Week</h2>

            <div className="space-y-6">
              {/* Week Visualization */}
              <div className="flex justify-between items-center gap-2">
                {weekSnapshots.map((snapshot, idx) => {
                  const hasActivity =
                    snapshot.focusItemsCompleted > 0 ||
                    snapshot.routineRunsCompleted > 0 ||
                    snapshot.totalFocusTimeMs > 0;

                  return (
                    <div
                      key={snapshot.date}
                      className="flex flex-col items-center gap-2 flex-1"
                    >
                      <div className="text-xs text-calm-muted font-medium">
                        {weekDayLabels[idx]}
                      </div>
                      <div
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          hasActivity
                            ? 'bg-calm-primary border-calm-primary'
                            : 'bg-transparent border-calm-border'
                        }`}
                        title={
                          hasActivity
                            ? `${snapshot.focusItemsCompleted + snapshot.routineRunsCompleted} items completed`
                            : 'No recorded activity'
                        }
                      />
                    </div>
                  );
                })}
              </div>

              {/* Weekly Message */}
              <div className="space-y-4 pt-2">
                <p className="text-lg text-calm-text font-medium leading-relaxed">
                  {getWeeklyReflectionMessage(weekSnapshots)}
                </p>
                <p className="text-calm-muted italic">That matters.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer spacing for mobile bottom nav - ensures tooltips and content aren't hidden */}
        <div className="h-24 md:h-0"></div>
      </div>
    </div>
  );
}
