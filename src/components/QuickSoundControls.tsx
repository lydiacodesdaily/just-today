/**
 * QuickSoundControls.tsx
 * Minimal, calm sound controls during routine execution.
 * Neurodivergent-friendly: always visible, no collapsing, minimal cognitive load.
 */

import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../constants/theme';

export function QuickSoundControls() {
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Simple row of toggle controls */}
      <View style={styles.controlRow}>
        <View style={styles.control}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Voice
          </Text>
          <Switch
            value={settings.ttsEnabled}
            onValueChange={() => toggleSetting('ttsEnabled')}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.control}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Ticking
          </Text>
          <Switch
            value={settings.tickingEnabled}
            onValueChange={() => toggleSetting('tickingEnabled')}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>

        <View style={styles.control}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Minutes
          </Text>
          <Switch
            value={settings.minuteAnnouncementsEnabled}
            onValueChange={() => toggleSetting('minuteAnnouncementsEnabled')}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            ios_backgroundColor={theme.colors.border}
          />
        </View>
      </View>

      {/* Subtle hint about full settings */}
      <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
        More sound options in Settings
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  control: {
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  hint: {
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.6,
  },
});
