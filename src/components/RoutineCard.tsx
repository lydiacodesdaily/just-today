/**
 * RoutineCard.tsx
 * Routine card for home screen.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RoutineTemplate, Pace } from '../models/RoutineTemplate';
import { useTheme } from '../constants/theme';
import { deriveTasksForPace } from '../engine/paceDerivation';

interface RoutineCardProps {
  routine: RoutineTemplate;
  onStart: () => void;
  onEdit: () => void;
  pace?: Pace; // Optional: if provided, shows task count for that pace
  canResume?: boolean;
}

export function RoutineCard({ routine, onStart, onEdit, pace, canResume }: RoutineCardProps) {
  const theme = useTheme();

  // Calculate filtered tasks based on pace
  const filteredTasks = pace
    ? deriveTasksForPace(routine.tasks, pace)
    : routine.tasks;

  const totalTasks = routine.tasks.length;
  const activeTasks = filteredTasks.length;
  const isFiltered = pace && activeTasks < totalTasks;

  // Calculate total duration for active tasks
  const totalMinutes = filteredTasks.reduce((sum, task) => sum + (task.durationMs / 60000), 0);
  const durationText = totalMinutes < 60
    ? `~${Math.round(totalMinutes)} min`
    : `~${Math.round(totalMinutes / 60)}h ${Math.round(totalMinutes % 60)}m`;

  // Task count text with pace filtering feedback
  const taskCountText = isFiltered
    ? `${activeTasks} of ${totalTasks} task${totalTasks !== 1 ? 's' : ''}`
    : `${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;

  // Get pace name for display
  const paceName = pace
    ? pace.charAt(0).toUpperCase() + pace.slice(1)
    : '';

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
            <View style={styles.emptyStateContainer}>
              <Text style={[styles.emptyStateText, { color: theme.colors.textTertiary }]}>
                💫 No tasks for {paceName} pace
              </Text>
              <Text style={[styles.emptyStateHint, { color: theme.colors.textTertiary }]}>
                Tap to add tasks
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.editHint, { color: theme.colors.textTertiary }]}>
          Tap to edit
        </Text>
      </TouchableOpacity>

      {/* Only show Start Routine button if there are tasks available */}
      {activeTasks > 0 && (
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <Text style={[styles.startButtonText, { color: theme.colors.surface }]}>
            {canResume ? 'Resume' : 'Start Routine'}
          </Text>
        </TouchableOpacity>
      )}
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
  emptyStateContainer: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  emptyStateHint: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
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
