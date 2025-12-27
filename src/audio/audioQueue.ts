/**
 * audioQueue.ts
 * Prevents overlapping TTS announcements with a simple queue.
 */

type SpeechTask = {
  text: string;
  resolve: () => void;
};

class AudioQueue {
  private queue: SpeechTask[] = [];
  private isSpeaking: boolean = false;
  private speakFunction: ((text: string) => Promise<void>) | null = null;

  /**
   * Sets the underlying speak function (injected from ttsEngine).
   */
  setSpeakFunction(fn: (text: string) => Promise<void>) {
    this.speakFunction = fn;
  }

  /**
   * Enqueues a speech task.
   */
  async speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push({ text, resolve });
      this.processQueue();
    });
  }

  /**
   * Processes the queue sequentially.
   */
  private async processQueue() {
    if (this.isSpeaking || this.queue.length === 0) {
      return;
    }

    this.isSpeaking = true;
    const task = this.queue.shift();

    if (task && this.speakFunction) {
      try {
        await this.speakFunction(task.text);
      } catch (error) {
        console.error('[audioQueue] TTS error:', error);
      }
      task.resolve();
    }

    this.isSpeaking = false;
    this.processQueue();
  }

  /**
   * Clears all pending speech.
   */
  clear() {
    this.queue = [];
  }

  /**
   * Returns true if currently speaking.
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const audioQueue = new AudioQueue();
