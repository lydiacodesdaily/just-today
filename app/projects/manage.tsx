/**
 * Projects Management
 * Add, rename, or remove projects.
 * Deleting a project keeps all its tasks — they just become ungrouped.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/constants/theme';
import { useProjects } from '../../src/context/ProjectsContext';
import { useFocus } from '../../src/context/FocusContext';
import { Project } from '../../src/models/Project';
import { FocusItem } from '../../src/models/FocusItem';

export default function ProjectsManage() {
  const theme = useTheme();
  const { projects, addProject, renameProject, deleteProject } = useProjects();
  const { completedItems } = useFocus();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [expandedCompleted, setExpandedCompleted] = useState<Set<string>>(new Set());

  const getCompletedForProject = (projectId: string): FocusItem[] =>
    completedItems
      .filter((i) => i.projectId === projectId)
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

  const toggleCompleted = (projectId: string) => {
    setExpandedCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const handleAdd = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDelete = (project: Project) => {
    Alert.alert(
      'Remove project?',
      `"${project.name}" will be removed. Any tasks in this project will stay — they just won't be grouped anymore.`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteProject(project.id),
        },
      ]
    );
  };

  const handleSave = async (name: string) => {
    if (editingProject) {
      await renameProject(editingProject.id, name);
    } else {
      await addProject(name);
    }
    setShowModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Projects</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Optional grouping for your tasks
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          {projects.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No projects yet. Add one if you'd like to group some tasks.
              </Text>
            </View>
          ) : (
            projects.map((project) => {
              const projectCompleted = getCompletedForProject(project.id);
              const isExpanded = expandedCompleted.has(project.id);
              return (
                <View key={project.id}>
                  <TouchableOpacity
                    style={[styles.item, { backgroundColor: theme.colors.surface }]}
                    onPress={() => handleEdit(project)}
                  >
                    <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                      {project.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(project)}
                    >
                      <Text style={[styles.deleteButtonText, { color: theme.colors.danger }]}>×</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {projectCompleted.length > 0 && (
                    <View style={[styles.completedSection, { backgroundColor: theme.colors.surface }]}>
                      <TouchableOpacity
                        style={styles.completedToggle}
                        onPress={() => toggleCompleted(project.id)}
                      >
                        <Text style={[styles.completedToggleText, { color: theme.colors.textSecondary }]}>
                          {isExpanded ? '▾' : '▸'} {projectCompleted.length} completed
                        </Text>
                      </TouchableOpacity>
                      {isExpanded && projectCompleted.map((item) => (
                        <View key={item.id} style={styles.completedRow}>
                          <Text style={[styles.completedCheck, { color: theme.colors.textTertiary }]}>✓</Text>
                          <Text
                            style={[styles.completedTitle, { color: theme.colors.textSecondary }]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          {item.completedAt && (
                            <Text style={[styles.completedDate, { color: theme.colors.textTertiary }]}>
                              {new Date(item.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}

          <TouchableOpacity
            style={[styles.addRow, { borderColor: theme.colors.border }]}
            onPress={handleAdd}
          >
            <Text style={[styles.addRowText, { color: theme.colors.primary }]}>+ Add project</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Add / Rename Modal */}
      {showModal && (
        <ProjectFormModal
          project={editingProject}
          onSave={handleSave}
          onCancel={() => setShowModal(false)}
        />
      )}
    </View>
  );
}

interface ProjectFormModalProps {
  project: Project | null;
  onSave: (name: string) => void;
  onCancel: () => void;
}

function ProjectFormModal({ project, onSave, onCancel }: ProjectFormModalProps) {
  const theme = useTheme();
  const [name, setName] = useState(project?.name || '');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Name needed', 'Give your project a short name.');
      return;
    }
    onSave(name.trim());
  };

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {project ? 'Rename project' : 'New project'}
          </Text>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Name</Text>
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Home Reno, Side Hustle"
            placeholderTextColor={theme.colors.textTertiary}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { borderColor: theme.colors.border }]}
              onPress={onCancel}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.modalButtonPrimary,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleSave}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    gap: 12,
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 28,
    fontWeight: '300',
  },
  addRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addRowText: {
    fontSize: 15,
    fontWeight: '600',
  },
  completedSection: {
    marginTop: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  completedToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  completedToggleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  completedCheck: {
    fontSize: 12,
    width: 16,
  },
  completedTitle: {
    fontSize: 14,
    flex: 1,
    textDecorationLine: 'line-through',
  },
  completedDate: {
    fontSize: 12,
  },
  bottomSpace: {
    height: 40,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
