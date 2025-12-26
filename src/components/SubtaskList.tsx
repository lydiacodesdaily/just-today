/**
 * SubtaskList.tsx
 * Checklist for task subtasks.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RunSubtask } from '../models/RoutineRun';
import { useTheme } from '../constants/theme';

interface SubtaskListProps {
  subtasks: RunSubtask[];
  onToggle: (subtaskId: string) => void;
}

export function SubtaskList({ subtasks, onToggle }: SubtaskListProps) {
  const theme = useTheme();

  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  const sortedSubtasks = [...subtasks].sort((a, b) => a.order - b.order);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
        Steps
      </Text>
      {sortedSubtasks.map((subtask) => (
        <TouchableOpacity
          key={subtask.id}
          style={[
            styles.subtask,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
          onPress={() => onToggle(subtask.id)}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: theme.colors.border,
                backgroundColor: subtask.checked
                  ? theme.colors.primary
                  : 'transparent',
              },
            ]}
          >
            {subtask.checked && <Text style={[styles.checkmark, { color: theme.colors.text }]}>✓</Text>}
          </View>
          <Text
            style={[
              styles.subtaskText,
              {
                color: subtask.checked
                  ? theme.colors.textSecondary
                  : theme.colors.text,
                textDecorationLine: subtask.checked ? 'line-through' : 'none',
              },
            ]}
          >
            {subtask.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtask: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtaskText: {
    fontSize: 16,
    flex: 1,
  },
});
