/**
 * voiceAnnouncements.ts
 * Enhanced TTS announcement messages with encouragement
 */

/**
 * Random selection helper
 */
function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Voice announcement messages organized by event type
 */
export const VOICE_ANNOUNCEMENTS = {
  taskStart: [
    'Starting {taskName}',
    'Let\'s begin {taskName}',
    'Time for {taskName}',
  ],

  taskComplete: [
    'Task complete. Nice work.',
    'You did it. Well done.',
    'Finished. You\'re doing great.',
    'Complete. Keep going.',
    'Done. You showed up.',
  ],

  milestone_1min: [
    '1 minute',
  ],

  milestone_5min: [
    '5 minutes in',
    '5 minutes. You\'re doing well.',
  ],

  milestone_10min: [
    '10 minutes in. You\'re doing great.',
    '10 minutes. Keep it up.',
  ],

  milestone_15min: [
    '15 minutes in.',
    '15 minutes. Nice focus.',
  ],

  milestone_20min: [
    '20 minutes in.',
    '20 minutes. You\'re doing well.',
  ],

  milestone_25min: [
    '25 minutes in.',
  ],

  milestone_30min: [
    '30 minutes in. You\'re doing great.',
    '30 minutes. Keep going.',
  ],

  milestone_45min: [
    '45 minutes in.',
    '45 minutes. Nice work.',
  ],

  milestone_60min: [
    '1 hour. Well done.',
    '1 hour in. You\'re doing great.',
  ],

  overtime_5min: [
    'You\'re 5 minutes over. That\'s okay — finish when you\'re ready.',
    '5 minutes overtime. No rush — complete at your pace.',
  ],

  overtime_10min: [
    '10 minutes over. Take your time.',
    'You\'re 10 minutes over. Finish when it feels right.',
  ],

  overtime_15min: [
    '15 minutes over. That\'s okay.',
  ],

  halfwayPoint: [
    'You\'re halfway through',
    'Halfway there. You\'ve got this.',
    'Halfway done. Keep going.',
  ],

  almostDone_2min: [
    'Almost done — 2 minutes left',
    '2 minutes remaining. You\'re almost there.',
    'Just 2 more minutes',
  ],

  almostDone_1min: [
    '1 minute left',
    'Almost done',
  ],

  encouragement: [
    'You\'re doing great',
    'Keep going, you\'ve got this',
    'You\'re making progress',
    'You\'re showing up, and that\'s what matters',
    'You\'re doing well',
    'This is good work',
  ],

  subtaskComplete: [
    'Subtask complete',
    'One more step done',
    'Nice progress',
  ],
};

/**
 * Get task start announcement
 */
export function getTaskStartAnnouncement(taskName: string): string {
  const template = randomFrom(VOICE_ANNOUNCEMENTS.taskStart);
  return template.replace('{taskName}', taskName);
}

/**
 * Get task complete announcement
 */
export function getTaskCompleteAnnouncement(): string {
  return randomFrom(VOICE_ANNOUNCEMENTS.taskComplete);
}

/**
 * Get milestone announcement for a specific time
 */
export function getMilestoneAnnouncement(elapsedMinutes: number): string {
  const key = `milestone_${elapsedMinutes}min` as keyof typeof VOICE_ANNOUNCEMENTS;

  if (VOICE_ANNOUNCEMENTS[key]) {
    return randomFrom(VOICE_ANNOUNCEMENTS[key] as string[]);
  }

  // Default fallback
  return `${elapsedMinutes} minutes`;
}

/**
 * Get overtime announcement
 */
export function getOvertimeAnnouncement(overtimeMinutes: number): string {
  const key = `overtime_${overtimeMinutes}min` as keyof typeof VOICE_ANNOUNCEMENTS;

  if (VOICE_ANNOUNCEMENTS[key]) {
    return randomFrom(VOICE_ANNOUNCEMENTS[key] as string[]);
  }

  // Default fallback
  return `You're ${overtimeMinutes} minutes over. That's okay.`;
}

/**
 * Get halfway point announcement
 */
export function getHalfwayAnnouncement(): string {
  return randomFrom(VOICE_ANNOUNCEMENTS.halfwayPoint);
}

/**
 * Get almost done announcement
 */
export function getAlmostDoneAnnouncement(minutesLeft: number): string {
  if (minutesLeft === 1) {
    return randomFrom(VOICE_ANNOUNCEMENTS.almostDone_1min);
  } else if (minutesLeft === 2) {
    return randomFrom(VOICE_ANNOUNCEMENTS.almostDone_2min);
  }

  return `${minutesLeft} minutes left`;
}

/**
 * Get random encouragement
 */
export function getEncouragementAnnouncement(): string {
  return randomFrom(VOICE_ANNOUNCEMENTS.encouragement);
}

/**
 * Get subtask completion announcement with progress
 */
export function getSubtaskCompleteAnnouncement(
  completedCount: number,
  totalCount: number
): string {
  const base = randomFrom(VOICE_ANNOUNCEMENTS.subtaskComplete);
  return `${base}. ${completedCount} of ${totalCount} done.`;
}

/**
 * Get subtask halfway announcement
 */
export function getSubtaskHalfwayAnnouncement(): string {
  return 'You\'re halfway through your subtasks';
}

/**
 * Determine if encouragement should be announced based on frequency setting
 */
export function shouldAnnounceEncouragement(
  frequency: 'never' | 'occasional' | 'frequent'
): boolean {
  if (frequency === 'never') return false;

  const chance = frequency === 'occasional' ? 0.3 : 0.6;
  return Math.random() < chance;
}
