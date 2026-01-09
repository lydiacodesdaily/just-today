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

interface UseAudioOptions {
  activeTask: RunTask | null;
  timeRemaining: TimeRemaining | null;
  settings: Settings;
  isPaused: boolean;
  onOvertimeAnnounced?: (minutes: number) => void;
}

/**
 * Manages audio during routine run.
 * Handles ticking, TTS announcements, overtime reminders.
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
    if (!activeTask || isPaused || !settings.tickingEnabled) {
      stopTicking();
      return;
    }

    startTicking();

    return () => {
      stopTicking();
    };
  }, [activeTask, isPaused, settings.tickingEnabled]);

  // Minute announcements
  useEffect(() => {
    if (
      !activeTask ||
      !timeRemaining ||
      isPaused ||
      !settings.minuteAnnouncementsEnabled ||
      !settings.ttsEnabled ||
      timeRemaining.isOvertime
    ) {
      return;
    }

    const currentMinute = Math.ceil(timeRemaining.remainingMs / (60 * 1000));

    if (currentMinute !== lastMinuteRef.current && currentMinute > 0) {
      lastMinuteRef.current = currentMinute;
      announceWithDucking(`${currentMinute} minute${currentMinute !== 1 ? 's' : ''}`);
    }
  }, [
    activeTask,
    timeRemaining,
    isPaused,
    settings.minuteAnnouncementsEnabled,
    settings.ttsEnabled,
  ]);

  // Overtime reminders
  useEffect(() => {
    if (
      !activeTask ||
      !timeRemaining ||
      isPaused ||
      !settings.overtimeRemindersEnabled ||
      !settings.ttsEnabled
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
    onOvertimeAnnounced,
  ]);

  // Reset overtime tracking when task changes
  useEffect(() => {
    hasAnnouncedOvertimeRef.current.clear();
    lastMinuteRef.current = null;
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
