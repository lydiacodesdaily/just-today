/**
 * soundEngine.ts
 * Manages ticking sound and audio ducking during TTS.
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';

let tickingSound: Sound | null = null;
let isTickingPlaying = false;
let normalVolume = 0.5;
let duckedVolume = 0.1;

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
 * Loads the ticking sound.
 */
export async function loadTickingSound(): Promise<void> {
  if (tickingSound) {
    return; // Already loaded
  }

  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/tick.mp3'),
      {
        isLooping: true,
        volume: normalVolume,
      }
    );
    tickingSound = sound;
  } catch (error) {
    console.error('Failed to load ticking sound:', error);
  }
}

/**
 * Starts playing the ticking sound loop.
 */
export async function startTicking(): Promise<void> {
  if (!tickingSound) {
    await loadTickingSound();
  }

  if (tickingSound && !isTickingPlaying) {
    try {
      await tickingSound.playAsync();
      isTickingPlaying = true;
    } catch (error) {
      console.error('Failed to start ticking:', error);
    }
  }
}

/**
 * Stops the ticking sound.
 */
export async function stopTicking(): Promise<void> {
  if (tickingSound && isTickingPlaying) {
    try {
      await tickingSound.stopAsync();
      isTickingPlaying = false;
    } catch (error) {
      console.error('Failed to stop ticking:', error);
    }
  }
}

/**
 * Ducks (reduces) ticking volume during TTS.
 */
export async function duckTicking(): Promise<void> {
  if (tickingSound && isTickingPlaying) {
    try {
      await tickingSound.setVolumeAsync(duckedVolume);
    } catch (error) {
      console.error('Failed to duck ticking:', error);
    }
  }
}

/**
 * Restores normal ticking volume after TTS.
 */
export async function unduckTicking(): Promise<void> {
  if (tickingSound && isTickingPlaying) {
    try {
      await tickingSound.setVolumeAsync(normalVolume);
    } catch (error) {
      console.error('Failed to unduck ticking:', error);
    }
  }
}

/**
 * Sets the ticking volume (0.0 to 1.0).
 */
export async function setTickingVolume(volume: number): Promise<void> {
  normalVolume = Math.max(0, Math.min(1, volume));
  if (tickingSound && isTickingPlaying) {
    try {
      await tickingSound.setVolumeAsync(normalVolume);
    } catch (error) {
      console.error('Failed to set ticking volume:', error);
    }
  }
}

/**
 * Plays a one-shot chime sound.
 */
export async function playChime(): Promise<void> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/chime.mp3'),
      { volume: normalVolume }
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
  }
}

/**
 * Cleans up audio resources.
 */
export async function unloadAudio(): Promise<void> {
  if (tickingSound) {
    try {
      await tickingSound.unloadAsync();
      tickingSound = null;
      isTickingPlaying = false;
    } catch (error) {
      console.error('Failed to unload ticking sound:', error);
    }
  }
}
