/**
 * ReviewItemsModal.tsx
 * Gentle modal for reviewing aged Someday items
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { FocusItem } from '../models/FocusItem';
import { calculateDaysInLater } from '../utils/archiveHelpers';

interface ReviewItemsModalProps {
  visible: boolean;
  items: FocusItem[];
  onKeep: (itemId: string) => void;
  onMoveToToday: (itemId: string) => void;
  onArchive: (itemId: string) => void;
  onKeepAll: () => void;
  onDismiss: () => void;
}

export function ReviewItemsModal({
  visible,
  items,
  onKeep,
  onMoveToToday,
  onArchive,
  onKeepAll,
  onDismiss,
}: ReviewItemsModalProps) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentItem = items[currentIndex];
  const hasMore = currentIndex < items.length - 1;

  const handleKeep = () => {
    onKeep(currentItem.id);
    moveToNext();
  };

  const handleMoveToToday = () => {
    onMoveToToday(currentItem.id);
    moveToNext();
  };

  const handleArchive = () => {
    onArchive(currentItem.id);
    moveToNext();
  };

  const moveToNext = () => {
    if (hasMore) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Done reviewing all items
      onDismiss();
      setCurrentIndex(0);
    }
  };

  const handleKeepAll = () => {
    onKeepAll();
    onDismiss();
    setCurrentIndex(0);
  };

  if (!currentItem) return null;

  const daysInLater = calculateDaysInLater(currentItem);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Someday Bucket Check-In
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {currentIndex + 1} of {items.length}
            </Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Current item */}
            <View style={styles.itemCard}>
              <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                "{currentItem.title}"
              </Text>
              <Text style={[styles.itemAge, { color: theme.colors.textSecondary }]}>
                This has been in Someday for {daysInLater} days.
              </Text>
              <Text style={[styles.questionText, { color: theme.colors.text }]}>
                What feels right?
              </Text>
            </View>

            {/* Action buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={handleKeep}
              >
                <Text style={[styles.actionButtonTitle, { color: theme.colors.text }]}>
                  Keep It
                </Text>
                <Text style={[styles.actionButtonDesc, { color: theme.colors.textSecondary }]}>
                  I still want to do this
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={handleMoveToToday}
              >
                <Text style={[styles.actionButtonTitle, { color: theme.colors.text }]}>
                  Move to Today
                </Text>
                <Text style={[styles.actionButtonDesc, { color: theme.colors.textSecondary }]}>
                  I'm ready to start
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={handleArchive}
              >
                <Text style={[styles.actionButtonTitle, { color: theme.colors.text }]}>
                  Archive
                </Text>
                <Text style={[styles.actionButtonDesc, { color: theme.colors.textSecondary }]}>
                  Not the right time
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom buttons */}
          <View style={[styles.bottomBar, { borderTopColor: theme.colors.border }]}>
            {currentIndex === 0 && items.length > 1 && (
              <TouchableOpacity
                style={styles.keepAllButton}
                onPress={handleKeepAll}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.keepAllButtonText, { color: theme.colors.textSecondary }]}>
                  Keep All
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 480,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 16,
  },
  itemCard: {
    marginBottom: 24,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemAge: {
    fontSize: 14,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionButtonDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  keepAllButton: {
    padding: 8,
  },
  keepAllButtonText: {
    fontSize: 16,
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
  },
});
