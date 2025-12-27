/**
 * TimerSettings.tsx
 * Quick access to timer-related settings during routine execution.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../constants/theme';
import { TickingSoundType } from '../models/Settings';

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
        if (sliderWidth === 0) return;
        const locationX = evt.nativeEvent.locationX;
        const newValue = Math.max(0, Math.min(1, locationX / sliderWidth));
        onValueChange(newValue);
      },
      onPanResponderMove: (evt) => {
        if (sliderWidth === 0) return;
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
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  fillTrack: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: -12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});

export function TimerSettings() {
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <View style={styles.container}>
      {/* Voice & Sounds */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Voice & Sounds
        </Text>

        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
            Voice Announcements
          </Text>
          <Switch
            value={settings.ttsEnabled}
            onValueChange={() => toggleSetting('ttsEnabled')}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
            Minute Countdowns
          </Text>
          <Switch
            value={settings.minuteAnnouncementsEnabled}
            onValueChange={() => toggleSetting('minuteAnnouncementsEnabled')}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
            Overtime Reminders
          </Text>
          <Switch
            value={settings.overtimeRemindersEnabled}
            onValueChange={() => toggleSetting('overtimeRemindersEnabled')}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
            Ticking Sound
          </Text>
          <Switch
            value={settings.tickingEnabled}
            onValueChange={() => toggleSetting('tickingEnabled')}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>
      </View>

      {/* Ticking Sound Type - Only show if ticking is enabled */}
      {settings.tickingEnabled && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Ticking Sound
          </Text>

          <View style={styles.soundOptions}>
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
          </View>
        </View>
      )}

      {/* Volume Controls */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Volume Levels
        </Text>

        <View style={styles.volumeControl}>
          <View style={styles.volumeHeader}>
            <Text style={[styles.volumeLabel, { color: theme.colors.text }]}>
              Voice
            </Text>
            <Text style={[styles.volumeValue, { color: theme.colors.primary }]}>
              {Math.round(settings.ttsVolume * 100)}%
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

        <View style={styles.volumeControl}>
          <View style={styles.volumeHeader}>
            <Text style={[styles.volumeLabel, { color: theme.colors.text }]}>
              Chimes & Alerts
            </Text>
            <Text style={[styles.volumeValue, { color: theme.colors.primary }]}>
              {Math.round(settings.announcementVolume * 100)}%
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

        <View style={styles.volumeControl}>
          <View style={styles.volumeHeader}>
            <Text style={[styles.volumeLabel, { color: theme.colors.text }]}>
              Ticking
            </Text>
            <Text style={[styles.volumeValue, { color: theme.colors.primary }]}>
              {Math.round(settings.tickingVolume * 100)}%
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
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  soundOptions: {
    gap: 10,
  },
  soundOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  soundOptionContent: {
    flex: 1,
    gap: 2,
  },
  soundOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  soundOptionSubtext: {
    fontSize: 12,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheck: {
    fontSize: 12,
    fontWeight: '700',
  },
  volumeControl: {
    gap: 8,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
