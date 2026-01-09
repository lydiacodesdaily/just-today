/**
 * Web Speech API wrapper for text-to-speech
 */

export async function speak(text: string, options: { volume?: number } = {}): Promise<void> {
  // Check if Web Speech API is available
  if (!('speechSynthesis' in window)) {
    return;
  }

  const synth = window.speechSynthesis;

  // Cancel any ongoing speech
  synth.cancel();

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = options.volume ?? 0.8;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = () => {
      // TTS errors are common and expected (browser policies, user interaction, etc.)
      // Gracefully degrade - don't break the app
      resolve();
    };

    synth.speak(utterance);
  });
}

export function stop(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
