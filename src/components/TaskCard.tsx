/**
 * TaskCard.tsx
 * Current active task display with breathing space and calm design.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RunTask } from '../models/RoutineRun';
import { TimeRemaining } from '../engine/timerEngine';
import { useTheme } from '../constants/theme';
import { TimeDisplay } from './TimeDisplay';
import { SubtaskList } from './SubtaskList';

interface TaskCardProps {
  task: RunTask;
  timeRemaining: TimeRemaining | null;
  onToggleSubtask: (subtaskId: string) => void;
}

export function TaskCard({ task, timeRemaining, onToggleSubtask }: TaskCardProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.borderSubtle,
          },
        ]}
      >
        {/* Gentle header with breathing room */}
        <View style={styles.header}>
          <Text style={[styles.focusLabel, { color: theme.colors.textSecondary }]}>
            Focus on
          </Text>
          <Text
            style={[
              styles.taskName,
              {
                color: theme.colors.text,
                lineHeight: 38,
              },
            ]}
          >
            {task.name}
          </Text>
        </View>

        {/* Timer with generous spacing */}
        <View style={styles.timerSection}>
          <TimeDisplay
            timeRemaining={timeRemaining}
            totalDurationMs={task.durationMs + task.extensionMs}
            originalDurationMs={task.durationMs}
          />
        </View>

        {/* Subtasks with clear separation */}
        {task.subtasks && task.subtasks.length > 0 && (
          <View style={styles.subtasksSection}>
            <View
              style={[
                styles.divider,
                { backgroundColor: theme.colors.borderSubtle },
              ]}
            />
            <SubtaskList subtasks={task.subtasks} onToggle={onToggleSubtask} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  card: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  focusLabel: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'lowercase',
    letterSpacing: 0.5,
  },
  taskName: {
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.5,
    paddingHorizontal: 8,
  },
  timerSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  subtasksSection: {
    gap: 20,
  },
  divider: {
    height: 1,
    width: '100%',
    marginTop: 8,
  },
});
