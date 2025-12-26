/**
 * settings.tsx
 * Settings screen for audio and behavior preferences.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useSettings } from '../../src/context/SettingsContext';
import { useTheme } from '../../src/constants/theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={[styles.header, { color: theme.colors.text }]}>
          Settings
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Audio
          </Text>

          <View
            style={[
              styles.setting,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Text-to-Speech
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Enable voice announcements
              </Text>
            </View>
            <Switch
              value={settings.ttsEnabled}
              onValueChange={() => toggleSetting('ttsEnabled')}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>

          <View
            style={[
              styles.setting,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Minute Announcements
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Announce each minute during task
              </Text>
            </View>
            <Switch
              value={settings.minuteAnnouncementsEnabled}
              onValueChange={() => toggleSetting('minuteAnnouncementsEnabled')}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>

          <View
            style={[
              styles.setting,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Ticking Sound
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Play ticking during active task
              </Text>
            </View>
            <Switch
              value={settings.tickingEnabled}
              onValueChange={() => toggleSetting('tickingEnabled')}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>

          <View
            style={[
              styles.setting,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Overtime Reminders
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Announce every 5 minutes of overtime
              </Text>
            </View>
            <Switch
              value={settings.overtimeRemindersEnabled}
              onValueChange={() => toggleSetting('overtimeRemindersEnabled')}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Just Today v1.0
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            A gentle routine execution engine
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
    padding: 16,
    gap: 24,
  },
  header: {
    fontSize: 34,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingInfo: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
  },
});
