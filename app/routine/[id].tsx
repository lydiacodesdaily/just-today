/**
 * routine/[id].tsx
 * Minimal routine template editor.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { RoutineTemplate, RoutineTask } from '../../src/models/RoutineTemplate';
import { getTemplate, updateTemplate, createTemplate } from '../../src/persistence/templateStore';
import { useTheme } from '../../src/constants/theme';

export default function RoutineEditorScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const taskInputRefs = useRef<{ [key: string]: TextInput | null }>({});

  useEffect(() => {
    if (id && id !== 'new') {
      getTemplate(id).then((template) => {
        if (template) {
          setName(template.name);
          setDescription(template.description || '');
          setTasks(template.tasks);
        }
      });
    }
  }, [id]);

  const handleSave = async () => {
    // Validate routine name
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a routine name');
      return;
    }

    // Validate at least one task exists
    if (tasks.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one task to the routine');
      return;
    }

    // Validate all tasks have names
    const unnamedTasks = tasks.filter(t => !t.name.trim());
    if (unnamedTasks.length > 0) {
      Alert.alert('Validation Error', 'All tasks must have a name');
      return;
    }

    // Validate all tasks have valid durations
    const invalidTasks = tasks.filter(t => !t.durationMs || isNaN(t.durationMs) || t.durationMs <= 0);
    if (invalidTasks.length > 0) {
      Alert.alert('Validation Error', 'All tasks must have a valid duration greater than 0');
      return;
    }

    const templateData = {
      name: name.trim(),
      description: description.trim(),
      tasks: tasks.map((t, i) => ({
        ...t,
        name: t.name.trim(),
        order: i,
        durationMs: Math.max(0, t.durationMs || 0)
      })),
    };

    try {
      if (id && id !== 'new') {
        await updateTemplate(id, templateData);
      } else {
        await createTemplate(templateData);
      }
      router.back();
    } catch (error) {
      console.error('Failed to save template:', error);
      Alert.alert('Save Error', 'Failed to save routine. Please try again.');
    }
  };

  const addTask = () => {
    const newTask: RoutineTask = {
      id: `task-${Date.now()}`,
      name: '',
      durationMs: 5 * 60 * 1000, // 5 minutes
      order: tasks.length,
      lowSafe: false,
      flowExtra: false,
      autoAdvance: false,
    };
    setTasks([...tasks, newTask]);

    // Auto-focus the new task's input after a brief delay
    setTimeout(() => {
      const input = taskInputRefs.current[newTask.id];
      if (input) {
        input.focus();
      }
    }, 100);
  };

  const updateTask = (index: number, updates: Partial<RoutineTask>) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], ...updates };
    setTasks(updated);
  };

  const deleteTask = (index: number) => {
    Alert.alert(
      'Delete Task',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setTasks(tasks.filter((_, i) => i !== index)),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {id === 'new' ? 'New Routine' : 'Edit Routine'}
          </Text>
        </View>

        <View
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <TextInput
            style={[styles.inputText, { color: theme.colors.text }]}
            placeholder="Routine name"
            placeholderTextColor={theme.colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <TextInput
            style={[styles.inputText, { color: theme.colors.text }]}
            placeholder="Description (optional)"
            placeholderTextColor={theme.colors.textSecondary}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Tasks
          </Text>

          {tasks.map((task, index) => (
            <View
              key={task.id}
              style={[
                styles.taskCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {/* Task name and duration - primary focus */}
              <View style={styles.taskHeader}>
                <TextInput
                  ref={(ref) => {
                    taskInputRefs.current[task.id] = ref;
                  }}
                  style={[styles.taskInput, { color: theme.colors.text }]}
                  placeholder="What needs doing?"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={task.name}
                  onChangeText={(text) => updateTask(index, { name: text })}
                  autoFocus={task.name === ''}
                  selectTextOnFocus
                />
                <View style={styles.durationControl}>
                  <TextInput
                    style={[
                      styles.durationInput,
                      {
                        backgroundColor: theme.colors.surfaceSecondary,
                        color: theme.colors.text,
                      },
                    ]}
                    keyboardType="number-pad"
                    value={String(Math.floor((task.durationMs || 0) / 60000))}
                    onChangeText={(text) => {
                      const minutes = parseInt(text, 10);
                      const validMinutes = isNaN(minutes) ? 0 : Math.max(0, minutes);
                      updateTask(index, { durationMs: validMinutes * 60000 });
                    }}
                  />
                  <Text style={[styles.durationLabel, { color: theme.colors.textSecondary }]}>
                    min
                  </Text>
                </View>
              </View>

              {/* Optional settings - subtle and grouped */}
              <View style={styles.taskOptions}>
                <View style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.chipToggle,
                      {
                        backgroundColor: task.lowSafe
                          ? theme.colors.primary
                          : theme.colors.surfaceSecondary,
                      },
                    ]}
                    onPress={() => updateTask(index, { lowSafe: !task.lowSafe })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: task.lowSafe ? theme.colors.background : theme.colors.textSecondary },
                      ]}
                    >
                      💤 Low
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.chipToggle,
                      {
                        backgroundColor: task.flowExtra
                          ? theme.colors.primary
                          : theme.colors.surfaceSecondary,
                      },
                    ]}
                    onPress={() => updateTask(index, { flowExtra: !task.flowExtra })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: task.flowExtra ? theme.colors.background : theme.colors.textSecondary },
                      ]}
                    >
                      ✨ Flow
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.chipToggle,
                      {
                        backgroundColor: task.autoAdvance
                          ? theme.colors.primary
                          : theme.colors.surfaceSecondary,
                      },
                    ]}
                    onPress={() => updateTask(index, { autoAdvance: !task.autoAdvance })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: task.autoAdvance ? theme.colors.background : theme.colors.textSecondary },
                      ]}
                    >
                      ⏭️ Auto
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Contextual help - only when relevant */}
                {(task.lowSafe || task.flowExtra || task.autoAdvance) && (
                  <Text style={[styles.subtleHint, { color: theme.colors.textSecondary }]}>
                    {task.autoAdvance && 'Auto-advances • '}
                    {task.lowSafe && task.flowExtra
                      ? 'All energy modes'
                      : task.lowSafe
                      ? 'Low energy mode'
                      : task.flowExtra
                      ? 'Flow mode only'
                      : 'Steady & Flow modes'}
                  </Text>
                )}
              </View>

              {/* Delete - subtle, bottom right */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTask(index)}
              >
                <Text style={[styles.deleteButtonText, { color: theme.colors.textSecondary }]}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={addTask}
          >
            <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>Add Task</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.success }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: theme.colors.surface }]}>Save Routine</Text>
        </TouchableOpacity>
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
    padding: 20,
    gap: 20,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputText: {
    fontSize: 16,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: 8,
  },
  durationControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    width: 50,
    textAlign: 'center',
    fontWeight: '600',
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskOptions: {
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chipToggle: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subtleHint: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  addButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
