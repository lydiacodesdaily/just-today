/**
 * QueueList.tsx
 * Up next queue with reorder controls.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { RunTask } from '../models/RoutineRun';
import { formatTime } from '../engine/timerEngine';
import { useTheme } from '../constants/theme';

interface QueueListProps {
  tasks: RunTask[];
  onMoveUp: (taskId: string) => void;
  onMoveDown: (taskId: string) => void;
  onMoveToNext: (taskId: string) => void;
  onMoveToEnd: (taskId: string) => void;
  onSkip: (taskId: string) => void;
}

export function QueueList({
  tasks,
  onMoveUp,
  onMoveDown,
  onMoveToNext,
  onMoveToEnd,
  onSkip,
}: QueueListProps) {
  const theme = useTheme();

  const pendingTasks = tasks
    .filter((t) => t.status === 'pending')
    .sort((a, b) => a.order - b.order);

  if (pendingTasks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
        Up Next ({pendingTasks.length})
      </Text>
      <ScrollView style={styles.list}>
        {pendingTasks.map((task, index) => (
          <View
            key={task.id}
            style={[
              styles.taskItem,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.taskInfo}>
              <Text style={[styles.taskName, { color: theme.colors.text }]}>
                {task.name}
              </Text>
              <Text style={[styles.taskDuration, { color: theme.colors.textSecondary }]}>
                {formatTime(task.durationMs + task.extensionMs)}
              </Text>
            </View>
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlButton, { borderColor: theme.colors.border }]}
                onPress={() => onMoveUp(task.id)}
                disabled={index === 0}
              >
                <Text
                  style={[
                    styles.controlButtonText,
                    { color: index === 0 ? theme.colors.border : theme.colors.text },
                  ]}
                >
                  ↑
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, { borderColor: theme.colors.border }]}
                onPress={() => onMoveDown(task.id)}
                disabled={index === pendingTasks.length - 1}
              >
                <Text
                  style={[
                    styles.controlButtonText,
                    {
                      color:
                        index === pendingTasks.length - 1
                          ? theme.colors.border
                          : theme.colors.text,
                    },
                  ]}
                >
                  ↓
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, { borderColor: theme.colors.border }]}
                onPress={() => onMoveToNext(task.id)}
              >
                <Text style={[styles.controlButtonText, { color: theme.colors.text }]}>
                  Next
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, { borderColor: theme.colors.border }]}
                onPress={() => onMoveToEnd(task.id)}
              >
                <Text style={[styles.controlButtonText, { color: theme.colors.text }]}>
                  End
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  { borderColor: theme.colors.danger, backgroundColor: theme.colors.danger },
                ]}
                onPress={() => onSkip(task.id)}
              >
                <Text style={[styles.controlButtonText, { color: theme.colors.text }]}>
                  Skip
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  taskItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  taskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  taskDuration: {
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  controlButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
