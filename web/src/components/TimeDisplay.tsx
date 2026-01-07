/**
 * TimeDisplay.tsx
 * Timer display with gentle, encouraging overtime messaging.
 */

import React from 'react';
import { TimeRemaining, formatTimeRemaining } from '@/src/engine/timerEngine';

interface TimeDisplayProps {
  timeRemaining: TimeRemaining | null;
  /** Total planned duration in milliseconds (optional, for progress indicator) */
  totalDurationMs?: number;
  /** Original planned duration before any extensions */
  originalDurationMs?: number;
}

export function TimeDisplay({ timeRemaining, totalDurationMs, originalDurationMs }: TimeDisplayProps) {
  if (!timeRemaining) {
    return null;
  }

  const overtimeMessages = [
    'It\'s okay to take your time',
    'No rush, keep going',
    'You\'re doing great',
    'Take all the time you need',
    'This is your routine, your pace',
    'Doing it is what matters',
  ];

  const getOvertimeMessage = () => {
    const minutes = Math.floor(timeRemaining.overtimeMs / 60000);
    // Rotate every 2 minutes instead of 5
    return overtimeMessages[Math.min(Math.floor(minutes / 2), overtimeMessages.length - 1)];
  };

  // Calculate progress text if totalDurationMs is provided
  const getProgressText = () => {
    if (!totalDurationMs || timeRemaining.isOvertime) return null;

    const elapsedMs = totalDurationMs - timeRemaining.remainingMs;
    const elapsedMinutes = Math.ceil(elapsedMs / 60000);
    const totalMinutes = Math.ceil(totalDurationMs / 60000);

    return `${elapsedMinutes} of ${totalMinutes} min`;
  };

  // Calculate total actual time spent (for when extensions have been added)
  const getTotalTimeText = () => {
    if (!originalDurationMs) return null;

    const totalElapsedMinutes = Math.ceil(timeRemaining.elapsedMs / 60000);
    const originalMinutes = Math.ceil(originalDurationMs / 60000);

    // Only show if we've gone beyond the original duration (either by extension or overtime)
    if (totalElapsedMinutes <= originalMinutes) return null;

    return `Total: ${totalElapsedMinutes} min`;
  };

  const progressText = getProgressText();
  const totalTimeText = getTotalTimeText();

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`text-6xl font-bold tabular-nums tracking-tight ${
          timeRemaining.isOvertime
            ? 'text-amber-600'
            : 'text-calm-primary'
        }`}
      >
        {formatTimeRemaining(timeRemaining)}
      </div>
      {progressText && (
        <div className="text-sm font-medium text-calm-muted -mt-1">
          {progressText}
        </div>
      )}
      {totalTimeText && (
        <div className="text-xs font-medium text-calm-muted opacity-70 -mt-2">
          {totalTimeText}
        </div>
      )}
      {timeRemaining.isOvertime && (
        <div className="flex flex-col items-center gap-1.5 mt-1">
          <div className="text-base font-semibold text-amber-600 lowercase">
            Extra time
          </div>
          <div className="text-sm text-calm-muted italic">
            {getOvertimeMessage()}
          </div>
        </div>
      )}
    </div>
  );
}
