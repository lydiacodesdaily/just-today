/**
 * soundEngine.ts
 * Manages ticking sound and audio ducking during TTS.
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import { TickingSoundType } from '../models/Settings';

let tickSound: Sound | null = null;
let tokSound: Sound | null = null;
let isTickingPlaying = false;
let currentTickingSoundType: TickingSoundType = 'tick1-tok1';
let isTickPhase = true; // Alternates between tick and tok
let tickingVolume = 0.5;
let announcementVolume = 0.7;
let duckedVolume = 0.1;
let tickInterval: NodeJS.Timeout | null = null;
let audioLoadFailed = false; // Track if audio loading has failed

/**
 * Sound file mappings for each ticking type.
 */
const TICK_TOK_SOUNDS = {
  'tick1-tok1': {
    tick: require('../../assets/sounds/effects/tick1.mp3'),
    tok: require('../../assets/sounds/effects/tok1.mp3'),
  },
  'tick2-tok2': {
    tick: require('../../assets/sounds/effects/tick2.wav'),
    tok: require('../../assets/sounds/effects/tok2.wav'),
  },
};

/**
 * Initializes the audio system.
 */
export async function initAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.error('Failed to set audio mode:', error);
  }
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

    const { sound: tick } = await Audio.Sound.createAsync(sounds.tick, {
      volume: tickingVolume,
    });
    tickSound = tick;

    const { sound: tok } = await Audio.Sound.createAsync(sounds.tok, {
      volume: tickingVolume,
    });
    tokSound = tok;

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
      await tickSound.unloadAsync();
      tickSound = null;
    }
    if (tokSound) {
      await tokSound.unloadAsync();
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
    await soundToPlay.setPositionAsync(0);
    await soundToPlay.playAsync();

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
    tickInterval = setInterval(async () => {
      await playAlternatingSound();
    }, 1000) as any;
  }
}

/**
 * Stops the ticking sound.
 */
export async function stopTicking(): Promise<void> {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }

  isTickingPlaying = false;
  isTickPhase = true; // Reset to tick

  // Stop any playing sounds with proper status checking
  try {
    if (tickSound) {
      const tickStatus = await tickSound.getStatusAsync();
      if (tickStatus.isLoaded && tickStatus.isPlaying) {
        await tickSound.stopAsync();
      }
    }
  } catch (error) {
    // Silently ignore - sound may be unloaded or interrupted
  }

  try {
    if (tokSound) {
      const tokStatus = await tokSound.getStatusAsync();
      if (tokStatus.isLoaded && tokStatus.isPlaying) {
        await tokSound.stopAsync();
      }
    }
  } catch (error) {
    // Silently ignore - sound may be unloaded or interrupted
  }
}

/**
 * Ducks (reduces) ticking volume during TTS.
 */
export async function duckTicking(): Promise<void> {
  if (isTickingPlaying && tickSound && tokSound) {
    try {
      const tickStatus = await tickSound.getStatusAsync();
      if (tickStatus.isLoaded) {
        await tickSound.setVolumeAsync(duckedVolume);
      }
    } catch (error) {
      // Silently ignore - sound may be unloaded
    }

    try {
      const tokStatus = await tokSound.getStatusAsync();
      if (tokStatus.isLoaded) {
        await tokSound.setVolumeAsync(duckedVolume);
      }
    } catch (error) {
      // Silently ignore - sound may be unloaded
    }
  }
}

/**
 * Restores normal ticking volume after TTS.
 */
export async function unduckTicking(): Promise<void> {
  if (isTickingPlaying && tickSound && tokSound) {
    try {
      const tickStatus = await tickSound.getStatusAsync();
      if (tickStatus.isLoaded) {
        await tickSound.setVolumeAsync(tickingVolume);
      }
    } catch (error) {
      // Silently ignore - sound may be unloaded
    }

    try {
      const tokStatus = await tokSound.getStatusAsync();
      if (tokStatus.isLoaded) {
        await tokSound.setVolumeAsync(tickingVolume);
      }
    } catch (error) {
      // Silently ignore - sound may be unloaded
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
      const tickStatus = await tickSound.getStatusAsync();
      if (tickStatus.isLoaded) {
        await tickSound.setVolumeAsync(tickingVolume);
      }
    } catch (error) {
      // Silently ignore - sound may be unloaded
    }

    try {
      const tokStatus = await tokSound.getStatusAsync();
      if (tokStatus.isLoaded) {
        await tokSound.setVolumeAsync(tickingVolume);
      }
    } catch (error) {
      // Silently ignore - sound may be unloaded
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
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/effects/ding.mp3'),
      { volume: announcementVolume }
    );
    await sound.playAsync();
    // Unload after playing
    sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.error('Failed to play chime:', error);
    // Don't set audioLoadFailed here, as this is a different sound
  }
}

/**
 * Cleans up audio resources.
 */
export async function unloadAudio(): Promise<void> {
  await stopTicking();
  await unloadTickingSounds();
}
