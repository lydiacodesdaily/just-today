/**
 * routine/[id].tsx
 * Minimal routine template editor.
 */

import React, { useEffect, useState } from 'react';
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
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }

    // Validate all tasks have valid durations
    const invalidTasks = tasks.filter(t => !t.durationMs || isNaN(t.durationMs) || t.durationMs <= 0);
    if (invalidTasks.length > 0) {
      Alert.alert('Error', 'All tasks must have a valid duration greater than 0');
      return;
    }

    const templateData = {
      name: name.trim(),
      description: description.trim(),
      tasks: tasks.map((t, i) => ({
        ...t,
        order: i,
        durationMs: Math.max(0, t.durationMs || 0)
      })),
    };

    if (id && id !== 'new') {
      await updateTemplate(id, templateData);
    } else {
      await createTemplate(templateData);
    }

    router.back();
  };

  const addTask = () => {
    const newTask: RoutineTask = {
      id: `task-${Date.now()}`,
      name: 'New Task',
      durationMs: 5 * 60 * 1000, // 5 minutes
      order: tasks.length,
      careSafe: false,
      flowExtra: false,
    };
    setTasks([...tasks, newTask]);
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
              <TextInput
                style={[styles.taskInput, { color: theme.colors.text }]}
                placeholder="Task name"
                placeholderTextColor={theme.colors.textSecondary}
                value={task.name}
                onChangeText={(text) => updateTask(index, { name: text })}
              />

              <View style={styles.taskOptions}>
                <View style={styles.option}>
                  <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                    Duration (min):
                  </Text>
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
                </View>

                <View style={styles.toggles}>
                  <TouchableOpacity
                    style={[
                      styles.toggle,
                      {
                        backgroundColor: task.careSafe
                          ? theme.colors.primary
                          : theme.colors.surfaceSecondary,
                      },
                    ]}
                    onPress={() => updateTask(index, { careSafe: !task.careSafe })}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        { color: task.careSafe ? '#FFFFFF' : theme.colors.text },
                      ]}
                    >
                      Care Safe
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggle,
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
                        styles.toggleText,
                        { color: task.flowExtra ? '#FFFFFF' : theme.colors.text },
                      ]}
                    >
                      Flow Extra
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.deleteButton, { borderColor: theme.colors.danger }]}
                onPress={() => deleteTask(index)}
              >
                <Text style={[styles.deleteButtonText, { color: theme.colors.danger }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={addTask}
          >
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.success }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Routine</Text>
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
    padding: 16,
    gap: 16,
  },
  header: {
    marginBottom: 8,
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  taskInput: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskOptions: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 14,
  },
  durationInput: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 14,
    width: 60,
  },
  toggles: {
    flexDirection: 'row',
    gap: 8,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
