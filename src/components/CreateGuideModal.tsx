/**
 * CreateGuideModal.tsx
 * Modal for creating custom guides
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../constants/theme';

interface CreateGuideModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string, items: string[]) => void;
  editingGuide?: { id: string; title: string; items: string[] } | null;
}

const MAX_ITEMS = 15;

export function CreateGuideModal({ visible, onClose, onCreate, editingGuide }: CreateGuideModalProps) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<string[]>(['']);

  const isEditing = !!editingGuide;

  // Load editing data
  useEffect(() => {
    if (editingGuide) {
      setTitle(editingGuide.title);
      setItems(editingGuide.items.length > 0 ? editingGuide.items : ['']);
    }
  }, [editingGuide]);

  const handleAddItem = () => {
    if (items.length < MAX_ITEMS) {
      setItems([...items, '']);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleCreate = () => {
    const trimmedTitle = title.trim();
    const trimmedItems = items.map((item) => item.trim()).filter((item) => item.length > 0);

    if (!trimmedTitle) {
      Alert.alert('Title Required', 'Please enter a title for your guide.');
      return;
    }

    if (trimmedItems.length === 0) {
      Alert.alert('Items Required', 'Please add at least one item to your guide.');
      return;
    }

    onCreate(trimmedTitle, trimmedItems);
    handleReset();
    onClose();
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setTitle('');
    setItems(['']);
  };

  const canAdd = items.length < MAX_ITEMS;
  const isValid = title.trim() && items.some((item) => item.trim());

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: theme.colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {isEditing ? 'Edit Guide' : 'Create Guide'}
          </Text>
          <TouchableOpacity onPress={handleCreate} style={styles.addButton} disabled={!isValid}>
            <Text
              style={[
                styles.addText,
                {
                  color: isValid ? theme.colors.primary : theme.colors.textSecondary,
                },
              ]}
            >
              {isEditing ? 'Save' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Helper Text */}
          <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
            Guides help you remember during transitions. Keep items concrete and personal. Max{' '}
            {MAX_ITEMS} items.
          </Text>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Guide Title</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.borderSubtle,
                },
              ]}
              placeholder="e.g., Morning Routine, Gym Bag, Doctor Visit"
              placeholderTextColor={theme.colors.textTertiary}
              value={title}
              onChangeText={setTitle}
              autoFocus={!isEditing}
              returnKeyType="next"
              maxLength={50}
            />
          </View>

          {/* Items */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Items</Text>
              <Text style={[styles.itemCount, { color: theme.colors.textTertiary }]}>
                {items.filter((i) => i.trim()).length} / {MAX_ITEMS}
              </Text>
            </View>

            <View style={styles.itemsList}>
              {items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View
                    style={[
                      styles.itemNumber,
                      { backgroundColor: theme.colors.surfaceSecondary },
                    ]}
                  >
                    <Text style={[styles.itemNumberText, { color: theme.colors.textSecondary }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.itemInput,
                      {
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: theme.colors.borderSubtle,
                      },
                    ]}
                    placeholder="Item name"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={item}
                    onChangeText={(value) => handleItemChange(index, value)}
                    returnKeyType={index === items.length - 1 ? 'done' : 'next'}
                    maxLength={100}
                  />
                  {items.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(index)}
                      style={styles.removeButton}
                      activeOpacity={0.7}
                    >
                      <Feather name="x" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Add Item Button */}
            {canAdd && (
              <TouchableOpacity
                onPress={handleAddItem}
                style={[
                  styles.addItemButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={18} color={theme.colors.text} />
                <Text style={[styles.addItemText, { color: theme.colors.text }]}>Add Item</Text>
              </TouchableOpacity>
            )}

            {!canAdd && (
              <Text style={[styles.maxItemsText, { color: theme.colors.textTertiary }]}>
                Maximum {MAX_ITEMS} items reached
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  cancelButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  addButton: {
    padding: 4,
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumberText: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  removeButton: {
    padding: 4,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  maxItemsText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
