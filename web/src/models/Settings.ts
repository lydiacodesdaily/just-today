/**
 * Settings.ts
 * User preferences for audio, announcements, and behavior.
 */

import { PlanningDay } from './WeeklyIntent';

export type TickingSoundType = 'tick1-tok1' | 'tick2-tok2' | 'beep';
export type MilestoneInterval = 1 | 5;
export type ThemePreference = 'light' | 'dark' | 'system';
export type FontSize = 'system' | 'small' | 'medium' | 'large' | 'extra-large';
export type FontFamily = 'system' | 'dyslexia-friendly';

export interface Settings {
  /** Schema version for migrations */
  version: number;
  /** Enable/disable TTS announcements */
  ttsEnabled: boolean;
  /** Announce each minute during planned task duration */
  minuteAnnouncementsEnabled: boolean;
  /** Play ticking sound during active task */
  tickingEnabled: boolean;
  /** Announce every 5 minutes of overtime */
  overtimeRemindersEnabled: boolean;
  /** Interval for time milestone announcements during active tasks (1 or 5 minutes) */
  milestoneInterval: MilestoneInterval;
  /** Selected TTS voice ID (platform-specific, optional) */
  voiceId?: string;
  /** Volume for TTS (0.0 to 1.0) */
  ttsVolume: number;
  /** Volume for minute announcements (0.0 to 1.0) */
  announcementVolume: number;
  /** Volume for ticking sound (0.0 to 1.0) */
  tickingVolume: number;
  /** Type of ticking sound to use */
  tickingSoundType: TickingSoundType;
  /** User's theme preference (light, dark, or system) */
  themePreference: ThemePreference;
  /** Font size preference for improved readability */
  fontSize: FontSize;
  /** Font family preference (includes dyslexia-friendly option) */
  fontFamily: FontFamily;
  /** High contrast mode for better visibility */
  highContrastMode: boolean;
  /** Reduce motion for users sensitive to animations */
  reduceMotion: boolean;
  /** Whether weekly intent feature is enabled */
  weeklyIntentEnabled: boolean;
  /** Day of week for weekly planning (0=Sun, 1=Mon, ..., 6=Sat) */
  weeklyPlanningDay: PlanningDay;
  /** Hour of day for planning nudge (0-23) */
  weeklyPlanningHour: number;
}

/** Current settings schema version */
export const CURRENT_SETTINGS_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  version: CURRENT_SETTINGS_VERSION,
  ttsEnabled: true,
  minuteAnnouncementsEnabled: false,
  tickingEnabled: true,
  overtimeRemindersEnabled: true,
  milestoneInterval: 5,
  ttsVolume: 0.8,
  announcementVolume: 0.7,
  tickingVolume: 0.5,
  tickingSoundType: 'tick1-tok1',
  themePreference: 'system',
  fontSize: 'system',
  fontFamily: 'system',
  highContrastMode: false,
  reduceMotion: false,
  weeklyIntentEnabled: false,
  weeklyPlanningDay: 1,
  weeklyPlanningHour: 9,
};
