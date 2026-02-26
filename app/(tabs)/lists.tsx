/**
 * lists.tsx
 * All lists overview — tap a list to open it.
 * Lists are for lightweight reference collections (grocery, wishlist, etc.)
 * They are NOT tasks — no time estimates, deadlines, or projects.
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
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/constants/theme';
import { useLists } from '../../src/context/ListsContext';
import { List } from '../../src/models/List';

const EMOJI_SUGGESTIONS = ['🛒', '📚', '🎬', '🎁', '✈️', '🏠', '💊', '🎵', '🍽️', '💡'];

export default function ListsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { lists, addList, renameList, updateListEmoji, deleteList } = useLists();
  const [showModal, setShowModal] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);

  const handleAdd = () => {
    setEditingList(null);
    setShowModal(true);
  };

  const handleEdit = (list: List) => {
    setEditingList(list);
    setShowModal(true);
  };

  const handleDelete = (list: List) => {
    Alert.alert(
      'Delete list?',
      `"${list.name}" and all its items will be removed permanently.`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteList(list.id),
        },
      ]
    );
  };

  const handleSave = async (name: string, emoji: string | undefined) => {
    if (editingList) {
      if (editingList.name !== name) await renameList(editingList.id, name);
      if (editingList.emoji !== emoji) await updateListEmoji(editingList.id, emoji);
    } else {
      await addList(name, emoji);
    }
    setShowModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {lists.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: theme.colors.textTertiary }]}>📋</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No lists yet</Text>
            <Text style={[styles.emptyBody, { color: theme.colors.textSecondary }]}>
              Create a list for things like groceries, books to read, or shows to watch.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {lists.map((list) => (
              <TouchableOpacity
                key={list.id}
                style={[styles.card, { backgroundColor: theme.colors.surface }]}
                onPress={() => router.push(`/lists/${list.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardEmoji}>{list.emoji || '📋'}</Text>
                  <Text
                    style={[styles.cardName, { color: theme.colors.text }]}
                    numberOfLines={2}
                  >
                    {list.name}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.cardMenu}
                  onPress={() => handleEdit(list)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="more-horizontal" size={18} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.addButton, { borderColor: theme.colors.border }]}
          onPress={handleAdd}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={18} color={theme.colors.primary} />
          <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>New list</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {showModal && (
        <ListFormModal
          list={editingList}
          onSave={handleSave}
          onDelete={editingList ? () => { setShowModal(false); handleDelete(editingList); } : undefined}
          onCancel={() => setShowModal(false)}
        />
      )}
    </View>
  );
}

interface ListFormModalProps {
  list: List | null;
  onSave: (name: string, emoji: string | undefined) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

function ListFormModal({ list, onSave, onDelete, onCancel }: ListFormModalProps) {
  const theme = useTheme();
  const [name, setName] = useState(list?.name || '');
  const [emoji, setEmoji] = useState<string | undefined>(list?.emoji);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Name needed', 'Give your list a short name.');
      return;
    }
    onSave(name.trim(), emoji);
  };

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {list ? 'Edit list' : 'New list'}
          </Text>

          {/* Emoji picker */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Emoji (optional)</Text>
          <View style={styles.emojiRow}>
            {EMOJI_SUGGESTIONS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[
                  styles.emojiOption,
                  emoji === e && { backgroundColor: theme.colors.primarySubtle ?? theme.colors.primary + '20' },
                ]}
                onPress={() => setEmoji(emoji === e ? undefined : e)}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name */}
          <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 16 }]}>Name</Text>
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Grocery, Books to read"
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

          {onDelete && (
            <TouchableOpacity style={styles.deleteLink} onPress={onDelete}>
              <Text style={[styles.deleteLinkText, { color: theme.colors.danger }]}>
                Delete list
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptyBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: {
    gap: 8,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  cardMenu: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
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
  deleteLink: {
    alignItems: 'center',
    paddingTop: 16,
  },
  deleteLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
