/**
 * RoutinePickerSheet.tsx
 * Bottom sheet for quick routine selection
 * Shows energy-filtered routines with Start buttons
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { useEnergy } from '../context/EnergyContext';
import { RoutineTemplate } from '../models/RoutineTemplate';

interface RoutinePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  routines: RoutineTemplate[];
  onStartRoutine: (routine: RoutineTemplate) => void;
  onCreateRoutine: () => void;
}

export function RoutinePickerSheet({
  visible,
  onClose,
  routines,
  onStartRoutine,
  onCreateRoutine,
}: RoutinePickerSheetProps) {
  const theme = useTheme();
  const { currentMode: energyMode } = useEnergy();

  const energyLabel = energyMode === 'low' ? 'Care' : energyMode === 'flow' ? 'Flow' : 'Steady';

  // Calculate visible tasks based on energy mode
  const getVisibleTaskCount = (routine: RoutineTemplate): number => {
    return routine.tasks.filter((task) => {
      if (energyMode === 'low') {
        return task.lowIncluded !== false;
      }
      if (energyMode === 'steady') {
        return task.steadyIncluded !== false;
      }
      return task.flowIncluded !== false; // flow mode
    }).length;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `~${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `~${hours} hour${hours > 1 ? 's' : ''}`;
    return `~${hours}h ${mins}m`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.colors.borderSubtle }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Your Routines
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>
              Filtered for {energyLabel} energy
            </Text>
          </View>

          {/* Routines list */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {routines.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No routines yet
                </Text>
              </View>
            ) : (
              routines.map((routine) => {
                const visibleTasks = getVisibleTaskCount(routine);
                const totalTasks = routine.tasks.length;
                const estimatedMs = routine.tasks
                  .filter((task) => {
                    if (energyMode === 'low') return task.lowIncluded !== false;
                    if (energyMode === 'steady') return task.steadyIncluded !== false;
                    return task.flowIncluded !== false;
                  })
                  .reduce((sum, task) => sum + (task.durationMs || 0), 0);
                const estimatedMinutes = Math.round(estimatedMs / 60000);

                return (
                  <View
                    key={routine.id}
                    style={[
                      styles.routineCard,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.borderSubtle,
                      },
                    ]}
                  >
                    <View style={styles.routineInfo}>
                      <Text style={[styles.routineName, { color: theme.colors.text }]}>
                        {routine.name}
                      </Text>
                      <Text style={[styles.routineMeta, { color: theme.colors.textTertiary }]}>
                        {visibleTasks === totalTasks
                          ? `${totalTasks} tasks`
                          : `${visibleTasks} of ${totalTasks} tasks`}
                        {estimatedMinutes > 0 && ` · ${formatDuration(estimatedMinutes)}`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => onStartRoutine(routine)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.startButtonText, { color: theme.colors.surface }]}>
                        Start
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}

            {/* Create new routine link */}
            <TouchableOpacity
              style={styles.createLink}
              onPress={onCreateRoutine}
              activeOpacity={0.7}
            >
              <Text style={[styles.createLinkText, { color: theme.colors.textSecondary }]}>
                + Create new routine
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    gap: 12,
    paddingBottom: 20,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 16,
  },
  routineInfo: {
    flex: 1,
    gap: 4,
  },
  routineName: {
    fontSize: 17,
    fontWeight: '500',
  },
  routineMeta: {
    fontSize: 13,
  },
  startButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  createLink: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  createLinkText: {
    fontSize: 15,
  },
});
