/**
 * Settings.ts
 * User preferences for audio, announcements, and behavior.
 */

export type TickingSoundType = 'tick1-tok1' | 'tick2-tok2' | 'beep';
export type MilestoneInterval = 1 | 5;
export type ThemePreference = 'light' | 'dark' | 'system';

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
  tickingSoundType: 'tick2-tok2',
  themePreference: 'system',
};
