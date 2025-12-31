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
  PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { useSettings } from '../../src/context/SettingsContext';
import { useTheme } from '../../src/constants/theme';
import { useThemeContext } from '../../src/context/ThemeContext';
import { TickingSoundType, ThemePreference } from '../../src/models/Settings';

/**
 * Simple custom slider component
 */
function VolumeSlider({
  value,
  onValueChange,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor
}: {
  value: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor: string;
  maximumTrackTintColor: string;
  thumbTintColor: string;
}) {
  const [sliderWidth, setSliderWidth] = React.useState(0);

  const panResponder = React.useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const locationX = evt.nativeEvent.locationX;
        const newValue = Math.max(0, Math.min(1, locationX / sliderWidth));
        onValueChange(newValue);
      },
      onPanResponderMove: (evt) => {
        const locationX = evt.nativeEvent.locationX;
        const newValue = Math.max(0, Math.min(1, locationX / sliderWidth));
        onValueChange(newValue);
      },
    }),
    [sliderWidth, onValueChange]
  );

  return (
    <View
      style={sliderStyles.container}
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
    >
      <View style={[sliderStyles.track, { backgroundColor: maximumTrackTintColor }]} />
      <View
        style={[
          sliderStyles.fillTrack,
          {
            backgroundColor: minimumTrackTintColor,
            width: `${value * 100}%`
          }
        ]}
      />
      <View
        style={[
          sliderStyles.thumb,
          {
            backgroundColor: thumbTintColor,
            left: `${value * 100}%`
          }
        ]}
      />
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    height: 48,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 6,
    borderRadius: 3,
  },
  fillTrack: {
    position: 'absolute',
    height: 6,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: -14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});

function getVolumeLabel(volume: number): string {
  const percentage = Math.round(volume * 100);
  if (percentage === 0) return 'Off';
  if (percentage <= 25) return 'Quiet';
  if (percentage <= 50) return 'Normal';
  if (percentage <= 75) return 'Loud';
  return 'Very Loud';
}

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
      const sounds = TICK_TOK_SOUNDS[soundType];
      const { sound: tick } = await Audio.Sound.createAsync(sounds.tick, {
        volume: settings.tickingVolume,
      });
      const { sound: tok } = await Audio.Sound.createAsync(sounds.tok, {
        volume: settings.tickingVolume,
      });

      // Play tick-tok pattern
      await tick.playAsync();
      await new Promise(resolve => setTimeout(resolve, 600));
      await tok.playAsync();
      await new Promise(resolve => setTimeout(resolve, 600));

      // Cleanup
      await tick.unloadAsync();
      await tok.unloadAsync();
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

            <View style={styles.themeToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.themeToggle,
                  styles.themeToggleLeft,
                  {
                    backgroundColor: themePreference === 'light'
                      ? theme.colors.primary
                      : 'transparent',
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setThemePreference('light')}
              >
                <Text style={[
                  styles.themeToggleText,
                  {
                    color: themePreference === 'light'
                      ? theme.colors.surface
                      : theme.colors.text
                  }
                ]}>
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeToggle,
                  styles.themeToggleMiddle,
                  {
                    backgroundColor: themePreference === 'dark'
                      ? theme.colors.primary
                      : 'transparent',
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setThemePreference('dark')}
              >
                <Text style={[
                  styles.themeToggleText,
                  {
                    color: themePreference === 'dark'
                      ? theme.colors.surface
                      : theme.colors.text
                  }
                ]}>
                  Dark
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeToggle,
                  styles.themeToggleRight,
                  {
                    backgroundColor: themePreference === 'system'
                      ? theme.colors.primary
                      : 'transparent',
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setThemePreference('system')}
              >
                <Text style={[
                  styles.themeToggleText,
                  {
                    color: themePreference === 'system'
                      ? theme.colors.surface
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
                        <Text style={[styles.selectedCheck, { color: theme.colors.text }]}>✓</Text>
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
                        <Text style={[styles.selectedCheck, { color: theme.colors.text }]}>✓</Text>
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
              </View>
            </View>
          </View>
        )}

        {/* Energy Menu Setup */}
        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/energy-menu/setup' as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Energy Menu
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
              Manage optional actions you can choose from based on your energy level
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
                    {getVolumeLabel(settings.ttsVolume)}
                  </Text>
                </View>
                <VolumeSlider
                  value={settings.ttsVolume}
                  onValueChange={(value: number) => updateSettings({ ttsVolume: value })}
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
                    {getVolumeLabel(settings.announcementVolume)}
                  </Text>
                </View>
                <VolumeSlider
                  value={settings.announcementVolume}
                  onValueChange={(value: number) => updateSettings({ announcementVolume: value })}
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
                    {getVolumeLabel(settings.tickingVolume)}
                  </Text>
                </View>
                <VolumeSlider
                  value={settings.tickingVolume}
                  onValueChange={(value: number) => updateSettings({ tickingVolume: value })}
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
  },
  themeToggle: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  themeToggleLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderRightWidth: 0,
  },
  themeToggleMiddle: {
    borderRadius: 0,
    borderRightWidth: 0,
  },
  themeToggleRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
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
  },
  previewButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
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
});
