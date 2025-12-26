/**
 * index.tsx
 * Home/Today screen - select energy and start routines.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { EnergyMode, RoutineTemplate } from '../../src/models/RoutineTemplate';
import { loadTemplates } from '../../src/persistence/templateStore';
import { createRunFromTemplate } from '../../src/engine/runEngine';
import { useRun } from '../../src/context/RunContext';
import { useTheme } from '../../src/constants/theme';
import { EnergyPicker } from '../../src/components/EnergyPicker';
import { RoutineCard } from '../../src/components/RoutineCard';
import { getItem, setItem, KEYS } from '../../src/persistence/storage';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { setCurrentRun, currentRun } = useRun();
  const [energyMode, setEnergyMode] = useState<EnergyMode>('steady');
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);

  // Load templates and energy mode on mount
  useEffect(() => {
    loadTemplates().then(setTemplates);
    getItem<EnergyMode>(KEYS.CURRENT_ENERGY).then((mode) => {
      if (mode) setEnergyMode(mode);
    });
  }, []);

  // Persist energy mode changes
  const handleEnergyChange = (mode: EnergyMode) => {
    setEnergyMode(mode);
    setItem(KEYS.CURRENT_ENERGY, mode);
  };

  const handleStartRoutine = (template: RoutineTemplate) => {
    const run = createRunFromTemplate(template, energyMode);
    setCurrentRun(run);
    router.push('/routine/run');
  };

  const handleEditRoutine = (template: RoutineTemplate) => {
    router.push(`/routine/${template.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Gentle, supportive header */}
        <View style={styles.headerSection}>
          <Text style={[styles.header, { color: theme.colors.text }]}>
            Just Today
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            One step at a time
          </Text>
        </View>

        {/* Energy picker with breathing room */}
        <View style={styles.energySection}>
          <EnergyPicker selectedMode={energyMode} onSelect={handleEnergyChange} />
        </View>

        {/* Routines section */}
        <View style={styles.routinesSection}>
          <View style={styles.routinesHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Your Routines
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Choose one to begin
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.createButton,
                {
                  backgroundColor: theme.colors.primarySubtle,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => router.push('/routine/new')}
              activeOpacity={0.7}
            >
              <Text style={[styles.createButtonText, { color: theme.colors.text }]}>
                + New
              </Text>
            </TouchableOpacity>
          </View>

          {templates.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderSubtle,
                },
              ]}
            >
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                Ready to start?
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Create your first routine to begin
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyCreateButton,
                  {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() => router.push('/routine/new')}
                activeOpacity={0.8}
              >
                <Text style={[styles.emptyCreateButtonText, { color: theme.colors.text }]}>
                  Create Your First Routine
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.routinesList}>
              {templates.map((template) => (
                <RoutineCard
                  key={template.id}
                  routine={template}
                  onStart={() => handleStartRoutine(template)}
                  onEdit={() => handleEditRoutine(template)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Resume button - gentle but present */}
        {currentRun && (
          <View style={styles.resumeSection}>
            <TouchableOpacity
              style={[
                styles.resumeButton,
                {
                  backgroundColor: theme.colors.warningSubtle,
                  borderColor: theme.colors.warning,
                },
              ]}
              onPress={() => router.push('/routine/run')}
              activeOpacity={0.7}
            >
              <Text style={[styles.resumeLabel, { color: theme.colors.warning }]}>
                In Progress
              </Text>
              <Text style={[styles.resumeText, { color: theme.colors.text }]}>
                {currentRun.templateName}
              </Text>
              <Text style={[styles.resumeAction, { color: theme.colors.warning }]}>
                Tap to continue →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Spacer for bottom padding */}
        <View style={styles.bottomSpacer} />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerSection: {
    paddingTop: 8,
    paddingBottom: 24,
    gap: 6,
  },
  header: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  energySection: {
    marginBottom: 32,
  },
  routinesSection: {
    gap: 16,
  },
  routinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  emptyCreateButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    minWidth: 240,
  },
  emptyCreateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  routinesList: {
    gap: 12,
  },
  resumeSection: {
    marginTop: 24,
  },
  resumeButton: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  resumeLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resumeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  resumeAction: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 20,
  },
});
