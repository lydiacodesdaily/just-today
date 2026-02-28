/**
 * useAudio.ts
 * Hook for managing audio state (ticking, TTS, announcements) - Web version.
 */

import { useEffect, useRef } from 'react';
import { RunTask } from '@/src/models/RoutineRun';
import { TimeRemaining } from '@/src/engine/timerEngine';
import { Settings } from '@/src/models/Settings';
import { checkOvertimeReminder, getOvertimeMessage } from '@/src/engine/overtimeEngine';
import { speak, stopSpeech, setVolume as setTTSVolume, initTTS } from '@/src/audio/ttsEngine.web';
import {
  startTicking,
  stopTicking,
  duckTicking,
  unduckTicking,
  setTickingVolume,
  setAnnouncementVolume,
  setTickingSoundType,
  initAudio,
} from '@/src/audio/soundEngine.web';

// Seconds at which to announce countdown (last 60s)
const COUNTDOWN_SECONDS = [50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

interface UseAudioOptions {
  activeTask: RunTask | null;
  timeRemaining: TimeRemaining | null;
  settings: Settings;
  isPaused: boolean;
  onOvertimeAnnounced?: (minutes: number) => void;
}

/**
 * Manages audio during routine run.
 * Handles ticking, TTS announcements, overtime reminders, and final countdown.
 */
export function useAudio({
  activeTask,
  timeRemaining,
  settings,
  isPaused,
  onOvertimeAnnounced,
}: UseAudioOptions) {
  const lastMinuteRef = useRef<number | null>(null);
  const hasAnnouncedOvertimeRef = useRef<Set<number>>(new Set());
  const announcedCountdownRef = useRef<Set<number>>(new Set());
  const isInitializedRef = useRef(false);

  // Initialize audio on first mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      initAudio();
      initTTS();
      isInitializedRef.current = true;
    }
  }, []);

  // Sync volumes and sound type
  useEffect(() => {
    setTTSVolume(settings.ttsVolume);
    setTickingVolume(settings.tickingVolume);
    setAnnouncementVolume(settings.announcementVolume);
  }, [settings.ttsVolume, settings.tickingVolume, settings.announcementVolume]);

  // Sync ticking sound type
  useEffect(() => {
    setTickingSoundType(settings.tickingSoundType);
  }, [settings.tickingSoundType]);

  // Manage ticking sound
  useEffect(() => {
    if (!activeTask || isPaused || !settings.tickingEnabled || settings.soundMuted) {
      stopTicking();
      return;
    }

    startTicking();

    return () => {
      stopTicking();
    };
  }, [activeTask, isPaused, settings.tickingEnabled, settings.soundMuted]);

  // Minute announcements (respects milestoneInterval)
  useEffect(() => {
    if (
      !activeTask ||
      !timeRemaining ||
      isPaused ||
      !settings.minuteAnnouncementsEnabled ||
      !settings.ttsEnabled ||
      settings.soundMuted ||
      timeRemaining.isOvertime
    ) {
      return;
    }

    const currentMinute = Math.ceil(timeRemaining.remainingMs / (60 * 1000));

    if (currentMinute !== lastMinuteRef.current && currentMinute > 0) {
      lastMinuteRef.current = currentMinute;

      // Announce if on the milestone interval boundary, or at 1 minute remaining
      const onInterval = currentMinute % settings.milestoneInterval === 0;
      const isLastMinute = currentMinute === 1;
      if (onInterval || isLastMinute) {
        announceWithDucking(`${currentMinute} minute${currentMinute !== 1 ? 's' : ''}`);
      }
    }
  }, [
    activeTask,
    timeRemaining,
    isPaused,
    settings.minuteAnnouncementsEnabled,
    settings.ttsEnabled,
    settings.soundMuted,
    settings.milestoneInterval,
  ]);

  // Final countdown (last 60 seconds)
  useEffect(() => {
    if (
      !activeTask ||
      !timeRemaining ||
      isPaused ||
      !settings.countdownEnabled ||
      !settings.ttsEnabled ||
      settings.soundMuted ||
      timeRemaining.isOvertime
    ) {
      return;
    }

    const remainingSeconds = Math.floor(timeRemaining.remainingMs / 1000);

    if (
      remainingSeconds <= 60 &&
      remainingSeconds > 0 &&
      COUNTDOWN_SECONDS.includes(remainingSeconds) &&
      !announcedCountdownRef.current.has(remainingSeconds)
    ) {
      announcedCountdownRef.current.add(remainingSeconds);
      announceWithDucking(String(remainingSeconds));
    }
  }, [
    activeTask,
    timeRemaining,
    isPaused,
    settings.countdownEnabled,
    settings.ttsEnabled,
    settings.soundMuted,
  ]);

  // Overtime reminders
  useEffect(() => {
    if (
      !activeTask ||
      !timeRemaining ||
      isPaused ||
      !settings.overtimeRemindersEnabled ||
      !settings.ttsEnabled ||
      settings.soundMuted
    ) {
      return;
    }

    const overtimeMinutes = checkOvertimeReminder(activeTask, timeRemaining);

    if (overtimeMinutes && !hasAnnouncedOvertimeRef.current.has(overtimeMinutes)) {
      hasAnnouncedOvertimeRef.current.add(overtimeMinutes);
      const message = getOvertimeMessage(activeTask.name, overtimeMinutes);
      announceWithDucking(message);
      onOvertimeAnnounced?.(overtimeMinutes);
    }
  }, [
    activeTask,
    timeRemaining,
    isPaused,
    settings.overtimeRemindersEnabled,
    settings.ttsEnabled,
    settings.soundMuted,
    onOvertimeAnnounced,
  ]);

  // Reset tracking when task changes
  useEffect(() => {
    hasAnnouncedOvertimeRef.current.clear();
    lastMinuteRef.current = null;
    announcedCountdownRef.current.clear();
  }, [activeTask?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      stopTicking();
    };
  }, []);
}

/**
 * Announces text with audio ducking.
 */
async function announceWithDucking(text: string) {
  await duckTicking();
  await speak(text);
  await unduckTicking();
}
