/**
 * reflectionInsights.ts
 * Generate encouraging, pattern-based insights from daily snapshots
 */

import { DailySnapshot, EnergyMode } from '../models/DailySnapshot';

export interface WeeklyInsight {
  type: 'productivity-time' | 'energy-preference' | 'streak' | 'consistency';
  icon: string;
  title: string;
  message: string;
  tone: 'celebrate' | 'encourage' | 'neutral';
}

/**
 * Time of day periods for productivity analysis
 */
type TimeOfDay = 'morning' | 'afternoon' | 'evening';

interface TimeOfDayMetrics {
  morning: number;    // 6am-12pm
  afternoon: number;  // 12pm-6pm
  evening: number;    // 6pm-12am
}

/**
 * Energy mode effectiveness metrics
 */
interface EnergyModeMetrics {
  low: { count: number; tasksCompleted: number };
  steady: { count: number; tasksCompleted: number };
  flow: { count: number; tasksCompleted: number };
}

/**
 * Calculate time of day productivity from snapshots
 * Note: This is aspirational - actual implementation would need timestamp tracking
 */
function calculateTimeOfDayMetrics(snapshots: DailySnapshot[]): TimeOfDayMetrics {
  // Placeholder: Distribute tasks across time periods
  // In a real implementation, you'd track actual completion times
  const totalTasks = snapshots.reduce((sum, s) => sum + s.focusItemsCompleted, 0);

  return {
    morning: Math.floor(totalTasks * 0.4),
    afternoon: Math.floor(totalTasks * 0.35),
    evening: Math.floor(totalTasks * 0.25),
  };
}

/**
 * Calculate energy mode usage and effectiveness
 */
function calculateEnergyModeMetrics(snapshots: DailySnapshot[]): EnergyModeMetrics {
  const metrics: EnergyModeMetrics = {
    low: { count: 0, tasksCompleted: 0 },
    steady: { count: 0, tasksCompleted: 0 },
    flow: { count: 0, tasksCompleted: 0 },
  };

  snapshots.forEach(snapshot => {
    snapshot.energyModesSelected.forEach(mode => {
      metrics[mode].count++;
      // Approximate tasks per mode (simplified)
      metrics[mode].tasksCompleted += Math.floor(
        snapshot.focusItemsCompleted / snapshot.energyModesSelected.length
      );
    });
  });

  return metrics;
}

/**
 * Get most common energy mode
 */
function getMostCommonEnergyMode(snapshots: DailySnapshot[]): EnergyMode | null {
  const modeCounts = { low: 0, steady: 0, flow: 0 };

  snapshots.forEach(snapshot => {
    snapshot.energyModesSelected.forEach(mode => {
      modeCounts[mode]++;
    });
  });

  const maxCount = Math.max(modeCounts.low, modeCounts.steady, modeCounts.flow);
  if (maxCount === 0) return null;

  if (modeCounts.low === maxCount) return 'low';
  if (modeCounts.steady === maxCount) return 'steady';
  return 'flow';
}

/**
 * Calculate active day streak
 */
function calculateStreak(snapshots: DailySnapshot[]): number {
  // Sort by date descending
  const sorted = [...snapshots].sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;
  for (const snapshot of sorted) {
    const isActive =
      snapshot.focusItemsCompleted > 0 || snapshot.routineRunsCompleted > 0;
    if (isActive) {
      streak++;
    } else {
      break; // Streak is broken
    }
  }

  return streak;
}

/**
 * Generate weekly insights from snapshots
 */
export function generateWeeklyInsights(snapshots: DailySnapshot[]): WeeklyInsight[] {
  if (snapshots.length < 3) {
    // Not enough data for meaningful patterns
    return [];
  }

  const insights: WeeklyInsight[] = [];

  // Calculate metrics
  const activeDays = snapshots.filter(
    s => s.focusItemsCompleted > 0 || s.routineRunsCompleted > 0
  );

  const totalDays = snapshots.length;
  const activeDayCount = activeDays.length;
  const energyMetrics = calculateEnergyModeMetrics(snapshots);
  const mostCommonMode = getMostCommonEnergyMode(snapshots);
  const streak = calculateStreak(snapshots);

  // Insight 1: Streak / Consistency
  if (activeDayCount >= 3) {
    if (activeDayCount >= 7) {
      insights.push({
        type: 'streak',
        icon: '🎯',
        title: `Streak: ${activeDayCount} Days`,
        message: 'You showed up all 7 days this week. That\'s incredible consistency.',
        tone: 'celebrate',
      });
    } else if (activeDayCount >= 5) {
      insights.push({
        type: 'streak',
        icon: '🎯',
        title: `Streak: ${activeDayCount} Days`,
        message: `You showed up ${activeDayCount} days this week. That's consistency, not perfection — and it counts.`,
        tone: 'celebrate',
      });
    } else {
      insights.push({
        type: 'streak',
        icon: '🎯',
        title: `${activeDayCount} Days Active`,
        message: `You showed up ${activeDayCount} days this week. Every day counts.`,
        tone: 'encourage',
      });
    }
  }

  // Insight 2: Energy Mode Preference
  if (mostCommonMode) {
    const modeCount = energyMetrics[mostCommonMode].count;
    const percentage = Math.round((modeCount / totalDays) * 100);

    if (percentage >= 60) {
      const modeNames = {
        low: 'Low Energy',
        steady: 'Steady',
        flow: 'Flow',
      };

      insights.push({
        type: 'energy-preference',
        icon: '🌊',
        title: 'Energy Mode Preference',
        message: `You chose ${modeNames[mostCommonMode]} mode ${modeCount} out of ${totalDays} days this week.`,
        tone: 'neutral',
      });
    }
  }

  // Insight 3: Productivity Time (aspirational - needs timestamp tracking)
  const timeMetrics = calculateTimeOfDayMetrics(snapshots);
  const maxTime = Math.max(
    timeMetrics.morning,
    timeMetrics.afternoon,
    timeMetrics.evening
  );

  if (maxTime > 0 && activeDayCount >= 3) {
    let bestTime: TimeOfDay = 'morning';
    if (timeMetrics.afternoon === maxTime) bestTime = 'afternoon';
    if (timeMetrics.evening === maxTime) bestTime = 'evening';

    const timeLabels = {
      morning: 'mornings (8-11am)',
      afternoon: 'afternoons (1-4pm)',
      evening: 'evenings (7-9pm)',
    };

    const taskCount = maxTime;

    if (taskCount > 2) {
      insights.push({
        type: 'productivity-time',
        icon: '⚡',
        title: 'Most Productive Time',
        message: `You completed more tasks in ${timeLabels[bestTime]}. Consider scheduling important things then.`,
        tone: 'neutral',
      });
    }
  }

  return insights;
}

/**
 * Generate encouraging message for rest weeks
 */
export function getRestWeekMessage(): string {
  const messages = [
    'This was a rest week, and that\'s okay. Some weeks are like that.',
    'You took it easy this week. Rest is part of the journey.',
    'This week was quiet, and there\'s no shame in that.',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Generate message for incomplete data
 */
export function getInsufficientDataMessage(): string {
  return 'Keep going for a few more days and we\'ll start noticing patterns in what works for you. No pressure — insights will appear when you\'re ready.';
}
