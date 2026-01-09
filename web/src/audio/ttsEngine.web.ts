/**
 * ttsEngine.web.ts
 * Text-to-speech wrapper using Web Speech API for web platform.
 */

import { audioQueue } from './audioQueue';

let currentVolume = 0.8;
let isSpeakingNow = false;

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
    if (!window.speechSynthesis) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = currentVolume;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      isSpeakingNow = false;
      resolve();
    };

    utterance.onerror = () => {
      isSpeakingNow = false;
      resolve();
    };

    isSpeakingNow = true;
    window.speechSynthesis.speak(utterance);
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
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  audioQueue.clear();
  isSpeakingNow = false;
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
  return isSpeakingNow || audioQueue.getIsSpeaking();
}

/**
 * Gets available voices (platform-dependent).
 */
export async function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!window.speechSynthesis) {
    return [];
  }

  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Voices may load asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };
  });
}
