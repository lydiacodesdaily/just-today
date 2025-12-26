/**
 * RoutineCard.tsx
 * Routine card for home screen.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RoutineTemplate } from '../models/RoutineTemplate';
import { useTheme } from '../constants/theme';

interface RoutineCardProps {
  routine: RoutineTemplate;
  onStart: () => void;
  onEdit: () => void;
}

export function RoutineCard({ routine, onStart, onEdit }: RoutineCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <TouchableOpacity onPress={onEdit} style={styles.content}>
        <Text style={[styles.name, { color: theme.colors.text }]}>
          {routine.name}
        </Text>
        {routine.description && (
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {routine.description}
          </Text>
        )}
        <Text style={[styles.taskCount, { color: theme.colors.textSecondary }]}>
          {routine.tasks.length} task{routine.tasks.length !== 1 ? 's' : ''}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
        onPress={onStart}
      >
        <Text style={styles.startButtonText}>Start</Text>
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
  content: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  taskCount: {
    fontSize: 12,
  },
  startButton: {
    padding: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
