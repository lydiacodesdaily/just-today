/**
 * lists/[id].tsx
 * Detail view for a single list — add, check, and manage items.
 * Items persist with their checked state so the list is always reusable.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/constants/theme';
import { useLists } from '../../src/context/ListsContext';
import { ListItem } from '../../src/models/List';

export default function ListDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lists, loadItemsForList, addListItem, toggleListItem, deleteListItem, clearCheckedItems } =
    useLists();

  const list = lists.find((l) => l.id === id);
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (id) {
      loadItemsForList(id).then(setItems);
    }
  }, [id, loadItemsForList]);

  const handleAdd = async () => {
    if (!newItemText.trim() || !id) return;
    const newItem = await addListItem(id, newItemText.trim());
    // Add at front of unchecked items
    setItems((prev) => {
      const unchecked = prev.filter((i) => !i.checked);
      const checked = prev.filter((i) => i.checked);
      return [...unchecked, newItem, ...checked];
    });
    setNewItemText('');
  };

  const handleToggle = async (item: ListItem) => {
    if (!id) return;
    const updated = await toggleListItem(item.id, id);
    setItems(updated);
  };

  const handleDelete = (item: ListItem) => {
    Alert.alert(
      'Remove item?',
      `"${item.text}" will be removed from this list.`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            const updated = await deleteListItem(item.id, id);
            setItems(updated);
          },
        },
      ]
    );
  };

  const handleClearChecked = () => {
    const checkedCount = items.filter((i) => i.checked).length;
    Alert.alert(
      'Clear checked items?',
      `Remove ${checkedCount} checked item${checkedCount !== 1 ? 's' : ''} from the list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            const updated = await clearCheckedItems(id);
            setItems(updated);
          },
        },
      ]
    );
  };

  const uncheckedItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);

  if (!list) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: theme.colors.textSecondary }]}>
            List not found.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          {list.emoji ? (
            <Text style={styles.headerEmoji}>{list.emoji}</Text>
          ) : null}
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{list.name}</Text>
        </View>
        {checkedItems.length > 0 && (
          <TouchableOpacity onPress={handleClearChecked} style={styles.clearButton}>
            <Text style={[styles.clearButtonText, { color: theme.colors.textSecondary }]}>
              Clear checked
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Items */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {items.length === 0 && !isAdding ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Nothing here yet. Add your first item below.
            </Text>
          </View>
        ) : null}

        {/* Unchecked items */}
        {uncheckedItems.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
            theme={theme}
          />
        ))}

        {/* Checked items — shown below with divider */}
        {checkedItems.length > 0 && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />
            {checkedItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
                theme={theme}
              />
            ))}
          </>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Add item bar */}
      <View
        style={[
          styles.addBar,
          { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.borderSubtle },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.addInput, { color: theme.colors.text }]}
          value={newItemText}
          onChangeText={setNewItemText}
          placeholder="Add item…"
          placeholderTextColor={theme.colors.textTertiary}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
          onFocus={() => setIsAdding(true)}
          onBlur={() => setIsAdding(false)}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.addSendButton,
            {
              backgroundColor: newItemText.trim()
                ? theme.colors.primary
                : theme.colors.borderSubtle,
            },
          ]}
          onPress={handleAdd}
          disabled={!newItemText.trim()}
          activeOpacity={0.7}
        >
          <Feather
            name="arrow-up"
            size={18}
            color={newItemText.trim() ? theme.colors.background : theme.colors.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

interface ItemRowProps {
  item: ListItem;
  onToggle: (item: ListItem) => void;
  onDelete: (item: ListItem) => void;
  theme: ReturnType<typeof useTheme>;
}

function ItemRow({ item, onToggle, onDelete, theme }: ItemRowProps) {
  return (
    <TouchableOpacity
      style={styles.itemRow}
      onPress={() => onToggle(item)}
      activeOpacity={0.6}
    >
      {/* Checkbox */}
      <View
        style={[
          styles.checkbox,
          {
            borderColor: item.checked ? theme.colors.primary : theme.colors.border,
            backgroundColor: item.checked ? theme.colors.primary : 'transparent',
          },
        ]}
      >
        {item.checked && (
          <Feather name="check" size={12} color={theme.colors.background} />
        )}
      </View>

      {/* Text */}
      <Text
        style={[
          styles.itemText,
          {
            color: item.checked ? theme.colors.textTertiary : theme.colors.text,
            textDecorationLine: item.checked ? 'line-through' : 'none',
          },
        ]}
        numberOfLines={3}
      >
        {item.text}
      </Text>

      {/* Delete */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="x" size={16} color={theme.colors.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 4,
  },
  headerTitles: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  clearButton: {
    paddingHorizontal: 4,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  deleteButton: {
    padding: 4,
    flexShrink: 0,
  },
  bottomSpace: {
    height: 20,
  },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
  },
  addInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  addSendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
  },
});
