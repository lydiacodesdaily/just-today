/**
 * pickOneSuggestions.ts
 * Utility functions for scoring and suggesting items for "Pick one thing" feature
 */

import { FocusItem, durationToMs, isCheckOnceDue, isReminderDue } from '../models/FocusItem';

export type SuggestionReason =
  | 'check-once-due'
  | 'reminder-due'
  | 'high-rollover'
  | 'short-duration'
  | 'oldest';

export interface ScoredItem {
  item: FocusItem;
  score: number;
  reason: SuggestionReason;
  reasonText: string;
}

/**
 * Score a Later item for "Pick one thing" suggestions
 * Higher scores = higher priority
 */
export function scoreItemForPicking(item: FocusItem): ScoredItem {
  let score = 0;
  let reason: SuggestionReason = 'oldest';
  let reasonText = '';

  // Circle back items due TODAY get highest priority
  if (isCheckOnceDue(item)) {
    score = 1000;
    reason = 'check-once-due';
    reasonText = 'Check today';
  }
  // Reminder date past today
  else if (item.reminderDate && isReminderDue(item.reminderDate)) {
    score = 800;
    reason = 'reminder-due';

    const daysPast = Math.floor(
      (Date.now() - new Date(item.reminderDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysPast === 0) {
      reasonText = 'Reminder today';
    } else if (daysPast === 1) {
      reasonText = 'Reminder from yesterday';
    } else {
      reasonText = `Reminder from ${daysPast} days ago`;
    }
  }
  // Items rolled over many times (persistent)
  else if ((item.rolloverCount || 0) > 2) {
    score = 600 + (item.rolloverCount! * 100);
    reason = 'high-rollover';
    reasonText = `Rolled over ${item.rolloverCount} times`;
  }
  // Quick wins (short duration) - tiebreaker
  else if (durationToMs(item.estimatedDuration) <= 15 * 60 * 1000) {
    score = 400;
    reason = 'short-duration';
    reasonText = 'Quick task';
  }
  // Oldest items
  else {
    const ageMs = Date.now() - new Date(item.movedToLaterAt || item.createdAt).getTime();
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    score = 100 + ageDays;
    reason = 'oldest';
    reasonText = ageDays > 0 ? `${ageDays} days old` : 'Recently added';
  }

  return { item, score, reason, reasonText };
}

/**
 * Get top N suggested Later items to pick from
 * @param laterItems All Later items
 * @param limit Maximum number of suggestions to return (default: 5)
 * @returns Sorted array of scored items (highest priority first)
 */
export function getPickOneSuggestions(
  laterItems: FocusItem[],
  limit: number = 5
): ScoredItem[] {
  return laterItems
    .map(scoreItemForPicking)
    .sort((a, b) => b.score - a.score) // Highest score first
    .slice(0, limit);
}

/**
 * Check if there are any high-priority suggestions
 * (circle back due or reminder due)
 */
export function hasHighPrioritySuggestions(laterItems: FocusItem[]): boolean {
  return laterItems.some(item =>
    isCheckOnceDue(item) || isReminderDue(item.reminderDate)
  );
}
