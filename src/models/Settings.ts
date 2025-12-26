/**
 * Settings.ts
 * User preferences for audio, announcements, and behavior.
 */

export interface Settings {
  /** Enable/disable TTS announcements */
  ttsEnabled: boolean;
  /** Announce each minute during planned task duration */
  minuteAnnouncementsEnabled: boolean;
  /** Play ticking sound during active task */
  tickingEnabled: boolean;
  /** Announce every 5 minutes of overtime */
  overtimeRemindersEnabled: boolean;
  /** Selected TTS voice ID (platform-specific, optional) */
  voiceId?: string;
  /** Master volume for sound effects (0.0 to 1.0) */
  soundVolume: number;
  /** Master volume for TTS (0.0 to 1.0) */
  ttsVolume: number;
}

export const DEFAULT_SETTINGS: Settings = {
  ttsEnabled: true,
  minuteAnnouncementsEnabled: false,
  tickingEnabled: true,
  overtimeRemindersEnabled: true,
  soundVolume: 0.5,
  ttsVolume: 0.8,
};
