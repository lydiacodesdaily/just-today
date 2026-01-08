/**
 * reflectionMessages.ts
 * Affirming, non-judgmental messages for daily reflections
 */

import { DailySnapshot } from '../models/DailySnapshot';

/**
 * Get an affirming message based on today's activity
 */
export function getTodayReflectionMessage(snapshot: DailySnapshot): string {
  const hasActivity =
    snapshot.focusItemsCompleted > 0 ||
    snapshot.routineRunsCompleted > 0 ||
    snapshot.totalFocusTimeMs > 0;

  if (!hasActivity) {
    return getTodayRestMessage();
  }

  const totalActions =
    snapshot.focusItemsCompleted + snapshot.routineRunsCompleted;

  if (totalActions === 1) {
    return "You showed up today. That's something.";
  }

  if (totalActions === 2) {
    return "You moved forward on a couple of things. That matters.";
  }

  if (totalActions >= 3) {
    return "Look at what you did today.";
  }

  return "You're here. That's enough.";
}

/**
 * Get a message for days with no recorded activity
 */
function getTodayRestMessage(): string {
  const messages = [
    "Some days are about just being. That's okay.",
    "You're here. That matters.",
    "Rest is part of the journey.",
    "Today was what it needed to be.",
  ];

  const now = new Date();
  const dayIndex = now.getDate() % messages.length;
  return messages[dayIndex];
}

/**
 * Get energy mode acknowledgment message
 */
export function getEnergyModeMessage(
  energyModes: ('low' | 'steady' | 'flow')[]
): string | null {
  if (energyModes.length === 0) return null;

  // If multiple modes, acknowledge adaptability
  if (energyModes.length > 1) {
    return "You listened to yourself today.";
  }

  const mode = energyModes[0];

  switch (mode) {
    case 'low':
      return "You chose Low energy — that's taking care of yourself.";
    case 'steady':
      return "Steady energy — one step at a time.";
    case 'flow':
      return "Flow energy — you felt the momentum.";
    default:
      return null;
  }
}

/**
 * Get message for items moved to Later
 */
export function getLaterItemsMessage(count: number): string | null {
  if (count === 0) return null;

  if (count === 1) {
    return "1 item moved to Later — that's okay.";
  }

  return `${count} items moved to Later — that's okay.`;
}

/**
 * Get closing message for the day
 */
export function getClosingMessage(): string {
  const messages = [
    "You showed up. That's what matters.",
    "That's a day. Rest well.",
    "You did what you could. That's enough.",
    "Tomorrow is a new day.",
    "Rest now.",
  ];

  const now = new Date();
  const dayIndex = now.getDate() % messages.length;
  return messages[dayIndex];
}

/**
 * Get weekly reflection message
 */
export function getWeeklyReflectionMessage(
  snapshots: DailySnapshot[]
): string {
  const daysWithActivity = snapshots.filter(
    (s) =>
      s.focusItemsCompleted > 0 ||
      s.routineRunsCompleted > 0 ||
      s.totalFocusTimeMs > 0
  ).length;

  if (daysWithActivity === 0) {
    return "This week, you took care of yourself.";
  }

  if (daysWithActivity === 1) {
    return "You showed up 1 day this week.";
  }

  if (daysWithActivity === 7) {
    return "You showed up every day this week. That matters.";
  }

  return `You showed up ${daysWithActivity} days this week.`;
}

/**
 * Get energy mode emoji
 */
export function getEnergyModeEmoji(mode: 'low' | 'steady' | 'flow'): string {
  switch (mode) {
    case 'low':
      return '💤';
    case 'steady':
      return '🌿';
    case 'flow':
      return '✨';
    default:
      return '';
  }
}
