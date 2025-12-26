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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={[styles.header, { color: theme.colors.text }]}>
          Just Today
        </Text>

        <EnergyPicker selectedMode={energyMode} onSelect={handleEnergyChange} />

        <View style={styles.routines}>
          <View style={styles.routinesHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Routines
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/routine/new')}
            >
              <Text style={styles.createButtonText}>+ New</Text>
            </TouchableOpacity>
          </View>
          {templates.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No routines yet. Create one to get started.
              </Text>
            </View>
          ) : (
            templates.map((template) => (
              <RoutineCard
                key={template.id}
                routine={template}
                onStart={() => handleStartRoutine(template)}
                onEdit={() => handleEditRoutine(template)}
              />
            ))
          )}
        </View>

        {currentRun && (
          <TouchableOpacity
            style={[styles.resumeButton, { backgroundColor: theme.colors.warning }]}
            onPress={() => router.push('/routine/run')}
          >
            <Text style={styles.resumeButtonText}>
              Resume {currentRun.templateName}
            </Text>
          </TouchableOpacity>
        )}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  routines: {
    gap: 12,
  },
  routinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  resumeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
