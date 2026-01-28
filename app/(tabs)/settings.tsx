/**
 * settings.tsx
 * Settings screen optimized for ADHD-friendly UX
 * Principles: Clear grouping, reduced cognitive load, calming visual hierarchy
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { useSettings } from '../../src/context/SettingsContext';
import { useTheme } from '../../src/constants/theme';
import { useThemeContext } from '../../src/context/ThemeContext';
import { TickingSoundType } from '../../src/models/Settings';

const TICK_TOK_SOUNDS = {
  'tick1-tok1': {
    tick: require('../../assets/sounds/effects/tick1.mp3'),
    tok: require('../../assets/sounds/effects/tok1.mp3'),
  },
  'tick2-tok2': {
    tick: require('../../assets/sounds/effects/tick2.wav'),
    tok: require('../../assets/sounds/effects/tok2.wav'),
  },
  'beep': {
    tick: require('../../assets/sounds/effects/beep.wav'),
    tok: require('../../assets/sounds/effects/beep.wav'),
  },
};

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const { themePreference, setThemePreference } = useThemeContext();

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const previewTickingSound = async (soundType: TickingSoundType) => {
    try {
      // Set audio mode to allow playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
      });

      const sounds = TICK_TOK_SOUNDS[soundType];
      const { sound: tick } = await Audio.Sound.createAsync(sounds.tick, {
        volume: settings.tickingVolume,
      });

      // Play tick sound
      await tick.playAsync();
      await new Promise(resolve => setTimeout(resolve, 600));

      // For beep, just play once; for others, play the tok sound too
      if (soundType !== 'beep') {
        const { sound: tok } = await Audio.Sound.createAsync(sounds.tok, {
          volume: settings.tickingVolume,
        });
        await tok.playAsync();
        await new Promise(resolve => setTimeout(resolve, 600));
        await tok.unloadAsync();
      }

      // Cleanup
      await tick.unloadAsync();
    } catch (error) {
      console.error('Failed to preview sound:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Softer header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.header, { color: theme.colors.text }]}>
            Settings
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Customize your experience
          </Text>
        </View>

        {/* Appearance Group */}
        <View style={styles.cardGroup}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Appearance
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
              Choose your preferred theme
            </Text>

            <View style={[styles.themeToggleContainer, { borderColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.themeToggle,
                  {
                    backgroundColor: themePreference === 'light'
                      ? '#FFFFFF'
                      : 'transparent',
                  },
                ]}
                onPress={() => setThemePreference('light')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.themeToggleText,
                  {
                    color: themePreference === 'light'
                      ? theme.colors.primary
                      : theme.colors.text
                  }
                ]}>
                  Light
                </Text>
              </TouchableOpacity>

              <View style={[styles.themeDivider, { backgroundColor: theme.colors.border }]} />

              <TouchableOpacity
                style={[
                  styles.themeToggle,
                  {
                    backgroundColor: themePreference === 'dark'
                      ? '#2A2C31'
                      : 'transparent',
                  },
                ]}
                onPress={() => setThemePreference('dark')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.themeToggleText,
                  {
                    color: themePreference === 'dark'
                      ? '#FFFFFF'
                      : theme.colors.text
                  }
                ]}>
                  Dark
                </Text>
              </TouchableOpacity>

              <View style={[styles.themeDivider, { backgroundColor: theme.colors.border }]} />

              <TouchableOpacity
                style={[
                  styles.themeToggle,
                  {
                    backgroundColor: themePreference === 'system'
                      ? theme.colors.primary
                      : 'transparent',
                  },
                ]}
                onPress={() => setThemePreference('system')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.themeToggleText,
                  {
                    color: themePreference === 'system'
                      ? '#FFFFFF'
                      : theme.colors.text
                  }
                ]}>
                  System
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Voice & Sounds Group - Most impactful settings first */}
        <View style={styles.cardGroup}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Voice & Sounds
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
              Control what you hear
            </Text>

            {/* Primary toggle - TTS */}
            <View style={styles.primaryToggle}>
              <View style={styles.toggleContent}>
                <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                  Voice Announcements
                </Text>
                <Text style={[styles.toggleHint, { color: theme.colors.textSecondary }]}>
                  Spoken updates during tasks
                </Text>
              </View>
              <Switch
                value={settings.ttsEnabled}
                onValueChange={() => toggleSetting('ttsEnabled')}
                trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
                ios_backgroundColor={theme.colors.border}
              />
            </View>

            {/* Secondary toggles - visually grouped and subdued */}
            <View style={styles.secondaryToggles}>
              <View style={styles.secondaryToggle}>
                <View style={styles.toggleContent}>
                  <Text style={[styles.secondaryLabel, { color: theme.colors.text }]}>
                    Minute Countdowns
                  </Text>
                </View>
                <Switch
                  value={settings.minuteAnnouncementsEnabled}
                  onValueChange={() => toggleSetting('minuteAnnouncementsEnabled')}
                  trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
                  ios_backgroundColor={theme.colors.border}
                />
              </View>

              <View style={styles.secondaryToggle}>
                <View style={styles.toggleContent}>
                  <Text style={[styles.secondaryLabel, { color: theme.colors.text }]}>
                    Overtime Reminders
                  </Text>
                </View>
                <Switch
                  value={settings.overtimeRemindersEnabled}
                  onValueChange={() => toggleSetting('overtimeRemindersEnabled')}
                  trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
                  ios_backgroundColor={theme.colors.border}
                />
              </View>

              <View style={styles.secondaryToggle}>
                <View style={styles.toggleContent}>
                  <Text style={[styles.secondaryLabel, { color: theme.colors.text }]}>
                    Ticking Sound
                  </Text>
                </View>
                <Switch
                  value={settings.tickingEnabled}
                  onValueChange={() => toggleSetting('tickingEnabled')}
                  trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
                  ios_backgroundColor={theme.colors.border}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Ticking Sound Choice - Only show if ticking is enabled */}
        {settings.tickingEnabled && (
          <View style={styles.cardGroup}>
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Ticking Sound
              </Text>
              <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
                Choose your preferred rhythm
              </Text>

              <View style={styles.soundOptions}>
                <View style={styles.soundOptionWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.soundOption,
                      {
                        backgroundColor: settings.tickingSoundType === 'tick2-tok2'
                          ? theme.colors.primary + '15'
                          : 'transparent',
                        borderColor: settings.tickingSoundType === 'tick2-tok2'
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                    onPress={() => updateSettings({ tickingSoundType: 'tick2-tok2' })}
                  >
                    <View style={styles.soundOptionContent}>
                      <Text style={[
                        styles.soundOptionLabel,
                        {
                          color: settings.tickingSoundType === 'tick2-tok2'
                            ? theme.colors.primary
                            : theme.colors.text
                        }
                      ]}>
                        Classic
                      </Text>
                      <Text style={[styles.soundOptionSubtext, { color: theme.colors.textSecondary }]}>
                        Traditional clock
                      </Text>
                    </View>
                    {settings.tickingSoundType === 'tick2-tok2' && (
                      <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.selectedCheck, { color: theme.colors.surface }]}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.previewButton, { borderColor: theme.colors.border }]}
                    onPress={() => previewTickingSound('tick2-tok2')}
                  >
                    <Text style={[styles.previewButtonText, { color: theme.colors.primary }]}>▶</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.soundOptionWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.soundOption,
                      {
                        backgroundColor: settings.tickingSoundType === 'tick1-tok1'
                          ? theme.colors.primary + '15'
                          : 'transparent',
                        borderColor: settings.tickingSoundType === 'tick1-tok1'
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                    onPress={() => updateSettings({ tickingSoundType: 'tick1-tok1' })}
                  >
                    <View style={styles.soundOptionContent}>
                      <Text style={[
                        styles.soundOptionLabel,
                        {
                          color: settings.tickingSoundType === 'tick1-tok1'
                            ? theme.colors.primary
                            : theme.colors.text
                        }
                      ]}>
                        Gentle
                      </Text>
                      <Text style={[styles.soundOptionSubtext, { color: theme.colors.textSecondary }]}>
                        Soft tick-tok
                      </Text>
                    </View>
                    {settings.tickingSoundType === 'tick1-tok1' && (
                      <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.selectedCheck, { color: theme.colors.surface }]}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.previewButton, { borderColor: theme.colors.border }]}
                    onPress={() => previewTickingSound('tick1-tok1')}
                  >
                    <Text style={[styles.previewButtonText, { color: theme.colors.primary }]}>▶</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.soundOptionWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.soundOption,
                      {
                        backgroundColor: settings.tickingSoundType === 'beep'
                          ? theme.colors.primary + '15'
                          : 'transparent',
                        borderColor: settings.tickingSoundType === 'beep'
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                    onPress={() => updateSettings({ tickingSoundType: 'beep' })}
                  >
                    <View style={styles.soundOptionContent}>
                      <Text style={[
                        styles.soundOptionLabel,
                        {
                          color: settings.tickingSoundType === 'beep'
                            ? theme.colors.primary
                            : theme.colors.text
                        }
                      ]}>
                        Beep
                      </Text>
                      <Text style={[styles.soundOptionSubtext, { color: theme.colors.textSecondary }]}>
                        Simple digital beep
                      </Text>
                    </View>
                    {settings.tickingSoundType === 'beep' && (
                      <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.selectedCheck, { color: theme.colors.surface }]}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.previewButton, { borderColor: theme.colors.border }]}
                    onPress={() => previewTickingSound('beep')}
                  >
                    <Text style={[styles.previewButtonText, { color: theme.colors.primary }]}>▶</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Extras Setup */}
        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/extras/setup' as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Extras
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
              Optional things that tend to feel good at each pace
            </Text>
            <Text style={[styles.linkArrow, { color: theme.colors.primary }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Volume Controls - Simplified and grouped */}
        <View style={styles.cardGroup}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Volume Levels
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
              Adjust to your comfort
            </Text>

            <View style={styles.volumeControls}>
              {/* Voice Volume */}
              <View style={styles.volumeControl}>
                <View style={styles.volumeHeader}>
                  <Text style={[styles.volumeLabel, { color: theme.colors.text }]}>
                    Voice
                  </Text>
                  <Text style={[styles.volumeValue, { color: theme.colors.primary }]}>
                    {Math.round(settings.ttsVolume * 100)}%
                  </Text>
                </View>
                <Slider
                  style={styles.slider}
                  value={settings.ttsVolume}
                  onValueChange={(value: number) => updateSettings({ ttsVolume: value })}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.border}
                  thumbTintColor={theme.colors.primary}
                />
              </View>

              {/* Announcements Volume */}
              <View style={styles.volumeControl}>
                <View style={styles.volumeHeader}>
                  <Text style={[styles.volumeLabel, { color: theme.colors.text }]}>
                    Chimes & Alerts
                  </Text>
                  <Text style={[styles.volumeValue, { color: theme.colors.primary }]}>
                    {Math.round(settings.announcementVolume * 100)}%
                  </Text>
                </View>
                <Slider
                  style={styles.slider}
                  value={settings.announcementVolume}
                  onValueChange={(value: number) => updateSettings({ announcementVolume: value })}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.border}
                  thumbTintColor={theme.colors.primary}
                />
              </View>

              {/* Ticking Volume */}
              <View style={styles.volumeControl}>
                <View style={styles.volumeHeader}>
                  <Text style={[styles.volumeLabel, { color: theme.colors.text }]}>
                    Ticking
                  </Text>
                  <Text style={[styles.volumeValue, { color: theme.colors.primary }]}>
                    {Math.round(settings.tickingVolume * 100)}%
                  </Text>
                </View>
                <Slider
                  style={styles.slider}
                  value={settings.tickingVolume}
                  onValueChange={(value: number) => updateSettings({ tickingVolume: value })}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.border}
                  thumbTintColor={theme.colors.primary}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Gentle footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Just Today
          </Text>
          <Text style={[styles.footerSubtext, { color: theme.colors.textSecondary }]}>
            A gentle routine companion
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://tally.so/r/Y50Qb5')}
              style={styles.contactLink}
            >
              <Text style={[styles.contactLinkText, { color: theme.colors.primary }]}>
                Contact Us
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://lydiastud.io/')}
              style={styles.contactLink}
            >
              <Text style={[styles.studioLinkText, { color: theme.colors.textSecondary }]}>
                by Lydia Studio
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 32,
    gap: 6,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  cardGroup: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  linkArrow: {
    fontSize: 24,
    fontWeight: '600',
    position: 'absolute',
    right: 20,
    top: 20,
    marginTop: -8,
    marginBottom: 4,
  },
  primaryToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleContent: {
    flex: 1,
    gap: 4,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleHint: {
    fontSize: 13,
  },
  secondaryToggles: {
    gap: 8,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  secondaryToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  secondaryLabel: {
    fontSize: 15,
    fontWeight: '400',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  themeToggle: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeDivider: {
    width: 1.5,
  },
  themeToggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  soundOptions: {
    gap: 12,
  },
  soundOptionWrapper: {
    flexDirection: 'row',
    gap: 8,
  },
  soundOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    height: 64,
  },
  previewButton: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  soundOptionContent: {
    flex: 1,
    gap: 2,
  },
  soundOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  soundOptionSubtext: {
    fontSize: 13,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheck: {
    fontSize: 14,
    fontWeight: '700',
  },
  volumeControls: {
    gap: 24,
  },
  volumeControl: {
    gap: 12,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  volumeValue: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  footer: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 32,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
  },
  footerLinks: {
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  contactLink: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  contactLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  studioLinkText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
