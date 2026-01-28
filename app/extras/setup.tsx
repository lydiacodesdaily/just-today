/**
 * Pace Picks Setup
 * Manage Pace Picks - optional things that tend to feel good at each pace.
 */

import React, { useState, useEffect } from 'react';
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
import {
  PacePick,
  EnergyLevel,
  EstimatedDuration,
} from '../../src/models/PacePick';
import {
  loadPacePicks,
  createPacePick,
  updatePacePick,
  deletePacePick,
} from '../../src/persistence/pacePicksStore';

const DURATION_OPTIONS: EstimatedDuration[] = ['~5 min', '~10 min', '~15 min', '~25 min'];

export default function PacePicksSetup() {
  const theme = useTheme();
  const [items, setItems] = useState<PacePick[]>([]);
  const [editingItem, setEditingItem] = useState<PacePick | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemLevel, setNewItemLevel] = useState<EnergyLevel>('low');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const loaded = await loadPacePicks();
    setItems(loaded);
  };

  const handleAddItem = (level: EnergyLevel) => {
    setNewItemLevel(level);
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEditItem = (item: PacePick) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDeleteItem = (item: PacePick) => {
    Alert.alert(
      'Remove item?',
      `Remove "${item.title}" from your Extras?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deletePacePick(item.id);
            await loadItems();
          },
        },
      ]
    );
  };

  const getItemsByLevel = (level: EnergyLevel) => {
    return items.filter(item => item.energyLevel === level).slice(0, 5);
  };

  // Map internal storage keys to user-facing pace labels
  const paceLevels: { level: EnergyLevel; icon: string; label: string; description: string; emptyText: string }[] = [
    {
      level: 'low',
      icon: '💤',
      label: 'Gentle',
      description: 'For days when you need gentleness',
      emptyText: 'No picks yet. Add something gentle.',
    },
    {
      level: 'steady',
      icon: '🌿',
      label: 'Steady',
      description: 'Your usual pace',
      emptyText: 'No picks yet. Add something steady.',
    },
    {
      level: 'flow',
      icon: '✨',
      label: 'Deep',
      description: 'When you have extra capacity',
      emptyText: 'No picks yet. Add something deep.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Extras</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Optional things that tend to feel good at each pace
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {paceLevels.map(({ level, icon, label, description, emptyText }) => {
          const levelItems = getItemsByLevel(level);
          return (
            <View key={level} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Text style={styles.sectionIcon}>{icon}</Text>
                  <View>
                    <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
                      {label}
                    </Text>
                    <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
                      {description}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.addButton, { borderColor: theme.colors.primary }]}
                  onPress={() => handleAddItem(level)}
                >
                  <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {levelItems.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    {emptyText}
                  </Text>
                </View>
              ) : (
                levelItems.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.item, { backgroundColor: theme.colors.surface }]}
                    onPress={() => handleEditItem(item)}
                  >
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                        {item.title}
                      </Text>
                      {item.estimatedDuration && (
                        <Text style={[styles.itemDuration, { color: theme.colors.textSecondary }]}>
                          {item.estimatedDuration}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteItem(item)}
                    >
                      <Text style={[styles.deleteButtonText, { color: theme.colors.danger }]}>×</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </View>
          );
        })}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ItemFormModal
          item={editingItem}
          defaultLevel={newItemLevel}
          onSave={async (title, duration) => {
            if (editingItem) {
              await updatePacePick(editingItem.id, { title, estimatedDuration: duration });
            } else {
              await createPacePick({
                title,
                energyLevel: newItemLevel,
                estimatedDuration: duration,
              });
            }
            await loadItems();
            setShowAddModal(false);
          }}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </View>
  );
}

interface ItemFormModalProps {
  item: PacePick | null;
  defaultLevel: EnergyLevel;
  onSave: (title: string, duration: EstimatedDuration | undefined) => void;
  onCancel: () => void;
}

function ItemFormModal({ item, defaultLevel, onSave, onCancel }: ItemFormModalProps) {
  const theme = useTheme();
  const [title, setTitle] = useState(item?.title || '');
  const [duration, setDuration] = useState<EstimatedDuration | undefined>(item?.estimatedDuration);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a title for this item.');
      return;
    }
    onSave(title.trim(), duration);
  };

  // Energy level-specific placeholder examples
  const placeholdersByLevel: Record<EnergyLevel, string> = {
    low: 'e.g., Reply to emails, Light admin, Organize notes',
    steady: 'e.g., Draft content, Review work',
    flow: 'e.g., Deep focus work, Creative tasks',
  };

  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {item ? 'Edit Item' : 'Add Item'}
          </Text>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            What would you like to do?
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder={placeholdersByLevel[defaultLevel]}
            placeholderTextColor={theme.colors.textTertiary}
            autoFocus
          />

          <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 16 }]}>
            How long might it take? (optional)
          </Text>
          <View style={styles.durationOptions}>
            {DURATION_OPTIONS.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.durationOption,
                  {
                    backgroundColor: duration === option ? theme.colors.primary : theme.colors.surface,
                    borderColor: duration === option ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setDuration(duration === option ? undefined : option)}
              >
                <Text
                  style={[
                    styles.durationOptionText,
                    { color: duration === option ? theme.colors.background : theme.colors.text },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    fontSize: 32,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemContent: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDuration: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 28,
    fontWeight: '300',
  },
  bottomSpace: {
    height: 40,
  },
  // Modal styles
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
  durationOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  durationOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  durationOptionText: {
    fontSize: 14,
    fontWeight: '500',
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
