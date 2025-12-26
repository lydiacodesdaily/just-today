/**
 * TaskCard.tsx
 * Current active task display.
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
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.taskName, { color: theme.colors.text }]}>
          {task.name}
        </Text>
        <TimeDisplay timeRemaining={timeRemaining} />
        {task.subtasks && task.subtasks.length > 0 && (
          <View style={styles.subtasks}>
            <SubtaskList
              subtasks={task.subtasks}
              onToggle={onToggleSubtask}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 24,
  },
  taskName: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtasks: {
    marginTop: 8,
  },
});
