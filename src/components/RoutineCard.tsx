/**
 * RoutineCard.tsx
 * Routine card for home screen.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RoutineTemplate, EnergyMode } from '../models/RoutineTemplate';
import { useTheme } from '../constants/theme';
import { deriveTasksForEnergyMode } from '../engine/energyDerivation';

interface RoutineCardProps {
  routine: RoutineTemplate;
  onStart: () => void;
  onEdit: () => void;
  energyMode?: EnergyMode; // Optional: if provided, shows task count for that mode
}

export function RoutineCard({ routine, onStart, onEdit, energyMode }: RoutineCardProps) {
  const theme = useTheme();

  // Calculate filtered tasks based on energy mode
  const filteredTasks = energyMode
    ? deriveTasksForEnergyMode(routine.tasks, energyMode)
    : routine.tasks;

  const totalTasks = routine.tasks.length;
  const activeTasks = filteredTasks.length;
  const isFiltered = energyMode && activeTasks < totalTasks;

  // Calculate total duration for active tasks
  const totalMinutes = filteredTasks.reduce((sum, task) => sum + (task.durationMs / 60000), 0);
  const durationText = totalMinutes < 60
    ? `~${Math.round(totalMinutes)} min`
    : `~${Math.round(totalMinutes / 60)}h ${Math.round(totalMinutes % 60)}m`;

  // Task count text with energy filtering feedback
  const taskCountText = isFiltered
    ? `${activeTasks} of ${totalTasks} task${totalTasks !== 1 ? 's' : ''}`
    : `${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <TouchableOpacity onPress={onEdit} style={styles.infoSection} activeOpacity={0.7}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {routine.name}
          </Text>
          {routine.description && (
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {routine.description}
            </Text>
          )}
          <Text style={[styles.taskCount, { color: theme.colors.textSecondary }]}>
            {taskCountText} · {durationText}
          </Text>
          {isFiltered && activeTasks === 0 && (
            <Text style={[styles.noTasksHint, { color: theme.colors.textTertiary }]}>
              No tasks for this energy level
            </Text>
          )}
        </View>
        <Text style={[styles.editHint, { color: theme.colors.textTertiary }]}>
          Tap to edit
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
        onPress={onStart}
        activeOpacity={0.8}
      >
        <Text style={[styles.startButtonText, { color: theme.colors.text }]}>
          Start Routine
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoSection: {
    padding: 18,
    gap: 8,
  },
  info: {
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  taskCount: {
    fontSize: 13,
    marginTop: 2,
  },
  noTasksHint: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  editHint: {
    fontSize: 12,
    textAlign: 'right',
  },
  startButton: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
