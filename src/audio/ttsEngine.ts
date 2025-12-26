/**
 * ttsEngine.ts
 * Text-to-speech wrapper using Expo Speech.
 */

import * as Speech from 'expo-speech';
import { audioQueue } from './audioQueue';

let currentVolume = 0.8;

/**
 * Initializes the TTS engine with the audio queue.
 */
export function initTTS() {
  audioQueue.setSpeakFunction(speakDirect);
}

/**
 * Direct speak function (used internally by queue).
 */
async function speakDirect(text: string): Promise<void> {
  return new Promise((resolve) => {
    Speech.speak(text, {
      volume: currentVolume,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: () => resolve(),
    });
  });
}

/**
 * Speaks text through the audio queue (prevents overlaps).
 */
export async function speak(text: string): Promise<void> {
  return audioQueue.speak(text);
}

/**
 * Stops all current and pending speech.
 */
export function stopSpeech(): void {
  Speech.stop();
  audioQueue.clear();
}

/**
 * Sets the TTS volume (0.0 to 1.0).
 */
export function setVolume(volume: number): void {
  currentVolume = Math.max(0, Math.min(1, volume));
}

/**
 * Returns true if TTS is currently speaking.
 */
export function isSpeaking(): boolean {
  return audioQueue.getIsSpeaking();
}

/**
 * Gets available voices (platform-dependent).
 */
export async function getAvailableVoices(): Promise<Speech.Voice[]> {
  return Speech.getAvailableVoicesAsync();
}
