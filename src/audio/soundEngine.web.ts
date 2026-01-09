/**
 * soundEngine.web.ts
 * Manages ticking sound and audio ducking using HTML5 Audio API for web platform.
 */

import { TickingSoundType } from '../models/Settings';

let tickSound: HTMLAudioElement | null = null;
let tokSound: HTMLAudioElement | null = null;
let isTickingPlaying = false;
let currentTickingSoundType: TickingSoundType = 'tick1-tok1';
let isTickPhase = true; // Alternates between tick and tok
let tickingVolume = 0.5;
let announcementVolume = 0.7;
let duckedVolume = 0.1;
let tickInterval: number | null = null;
let audioLoadFailed = false; // Track if audio loading has failed

/**
 * Sound file mappings for each ticking type.
 */
const TICK_TOK_SOUNDS = {
  'tick1-tok1': {
    tick: '/assets/sounds/effects/tick1.mp3',
    tok: '/assets/sounds/effects/tok1.mp3',
  },
  'tick2-tok2': {
    tick: '/assets/sounds/effects/tick2.wav',
    tok: '/assets/sounds/effects/tok2.wav',
  },
};

/**
 * Initializes the audio system.
 */
export async function initAudio(): Promise<void> {
  // No special initialization needed for web
  console.log('Web audio initialized');
}

/**
 * Loads the ticking sounds based on the selected type.
 */
export async function loadTickingSound(soundType?: TickingSoundType): Promise<void> {
  // Update sound type if provided
  if (soundType) {
    currentTickingSoundType = soundType;
  }

  // Unload existing sounds if they exist
  await unloadTickingSounds();

  try {
    const sounds = TICK_TOK_SOUNDS[currentTickingSoundType];

    tickSound = new Audio(sounds.tick);
    tickSound.volume = tickingVolume;
    tickSound.preload = 'auto';

    tokSound = new Audio(sounds.tok);
    tokSound.volume = tickingVolume;
    tokSound.preload = 'auto';

    // Preload both sounds
    await Promise.all([
      tickSound.load(),
      tokSound.load(),
    ]);

    audioLoadFailed = false; // Successfully loaded
  } catch (error) {
    console.error('Failed to load ticking sounds:', error);
    audioLoadFailed = true;
    tickSound = null;
    tokSound = null;
  }
}

/**
 * Unloads the current ticking sounds.
 */
async function unloadTickingSounds(): Promise<void> {
  try {
    if (tickSound) {
      tickSound.pause();
      tickSound.src = '';
      tickSound = null;
    }
    if (tokSound) {
      tokSound.pause();
      tokSound.src = '';
      tokSound = null;
    }
  } catch (error) {
    console.error('Failed to unload ticking sounds:', error);
  }
}

/**
 * Plays alternating tick/tok sounds.
 */
async function playAlternatingSound(): Promise<void> {
  if (!tickSound || !tokSound) {
    return;
  }

  try {
    const soundToPlay = isTickPhase ? tickSound : tokSound;

    // Reset to beginning and play
    soundToPlay.currentTime = 0;
    const playPromise = soundToPlay.play();

    // Handle play promise rejection (autoplay policy)
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('Failed to play tick/tok sound:', error);
      });
    }

    // Toggle for next iteration
    isTickPhase = !isTickPhase;
  } catch (error) {
    console.error('Failed to play tick/tok sound:', error);
  }
}

/**
 * Starts playing the alternating ticking sound (1 second intervals).
 */
export async function startTicking(): Promise<void> {
  if (audioLoadFailed) {
    // Audio previously failed to load, don't try again
    return;
  }

  if (!tickSound || !tokSound) {
    await loadTickingSound();
  }

  // If sounds still aren't loaded after attempting to load, bail out gracefully
  if (!tickSound || !tokSound) {
    console.warn('Ticking sounds not available, skipping audio');
    return;
  }

  if (!isTickingPlaying) {
    isTickingPlaying = true;
    isTickPhase = true; // Start with tick

    // Play immediately
    await playAlternatingSound();

    // Then play every 1 second
    tickInterval = window.setInterval(async () => {
      await playAlternatingSound();
    }, 1000);
  }
}

/**
 * Stops the ticking sound.
 */
export async function stopTicking(): Promise<void> {
  if (tickInterval !== null) {
    clearInterval(tickInterval);
    tickInterval = null;
  }

  isTickingPlaying = false;
  isTickPhase = true; // Reset to tick

  // Stop any playing sounds
  try {
    if (tickSound && !tickSound.paused) {
      tickSound.pause();
    }
  } catch (error) {
    // Silently ignore
  }

  try {
    if (tokSound && !tokSound.paused) {
      tokSound.pause();
    }
  } catch (error) {
    // Silently ignore
  }
}

/**
 * Ducks (reduces) ticking volume during TTS.
 */
export async function duckTicking(): Promise<void> {
  if (isTickingPlaying && tickSound && tokSound) {
    try {
      tickSound.volume = duckedVolume;
      tokSound.volume = duckedVolume;
    } catch (error) {
      // Silently ignore
    }
  }
}

/**
 * Restores normal ticking volume after TTS.
 */
export async function unduckTicking(): Promise<void> {
  if (isTickingPlaying && tickSound && tokSound) {
    try {
      tickSound.volume = tickingVolume;
      tokSound.volume = tickingVolume;
    } catch (error) {
      // Silently ignore
    }
  }
}

/**
 * Sets the ticking volume (0.0 to 1.0).
 */
export async function setTickingVolume(volume: number): Promise<void> {
  tickingVolume = Math.max(0, Math.min(1, volume));
  if (tickSound && tokSound) {
    try {
      tickSound.volume = tickingVolume;
      tokSound.volume = tickingVolume;
    } catch (error) {
      // Silently ignore
    }
  }
}

/**
 * Sets the announcement volume (0.0 to 1.0).
 */
export function setAnnouncementVolume(volume: number): void {
  announcementVolume = Math.max(0, Math.min(1, volume));
}

/**
 * Gets the current announcement volume.
 */
export function getAnnouncementVolume(): number {
  return announcementVolume;
}

/**
 * Sets the ticking sound type and reloads the sounds.
 */
export async function setTickingSoundType(soundType: TickingSoundType): Promise<void> {
  const wasPlaying = isTickingPlaying;

  // Stop if playing
  if (wasPlaying) {
    await stopTicking();
  }

  // Load new sounds
  await loadTickingSound(soundType);

  // Restart if it was playing
  if (wasPlaying) {
    await startTicking();
  }
}

/**
 * Plays a one-shot ding sound.
 */
export async function playChime(): Promise<void> {
  if (audioLoadFailed) {
    // Audio system has failed, skip silently
    return;
  }

  try {
    const chime = new Audio('/assets/sounds/effects/ding.mp3');
    chime.volume = announcementVolume;
    chime.preload = 'auto';

    const playPromise = chime.play();

    // Handle play promise rejection (autoplay policy)
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('Failed to play chime:', error);
      });
    }
  } catch (error) {
    console.error('Failed to play chime:', error);
  }
}

/**
 * Cleans up audio resources.
 */
export async function unloadAudio(): Promise<void> {
  await stopTicking();
  await unloadTickingSounds();
}
