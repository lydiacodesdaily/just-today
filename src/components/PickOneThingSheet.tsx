/**
 * PickOneThingSheet.tsx
 * Bottom sheet for "Pick one thing" feature
 * Shows: Ready for Today (Later items) + Pace Picks + Add Custom
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { usePace } from '../context/PaceContext';
import { FocusItem } from '../models/FocusItem';
import { PacePick } from '../models/PacePick';
import { getPickOneSuggestions, ScoredItem } from '../utils/pickOneSuggestions';

interface PickOneThingSheetProps {
  visible: boolean;
  onClose: () => void;
  laterItems: FocusItem[];
  pacePicks: PacePick[];
  onStartLaterItem: (item: FocusItem, reason: string) => void;
  onStartPacePick: (pacePick: PacePick) => void;
  onAddCustom: () => void;
}

export function PickOneThingSheet({
  visible,
  onClose,
  laterItems,
  pacePicks,
  onStartLaterItem,
  onStartPacePick,
  onAddCustom,
}: PickOneThingSheetProps) {
  const theme = useTheme();
  const { currentPace } = usePace();

  // Get top 5 suggested Later items
  const suggestions = useMemo(
    () => getPickOneSuggestions(laterItems, 5),
    [laterItems]
  );

  // Filter pace picks by current pace
  const filteredPacePicks = useMemo(
    () => pacePicks.filter((pick) => pick.paceTag === currentPace),
    [pacePicks, currentPace]
  );

  const paceLabel = currentPace === 'low' ? 'Gentle' : currentPace === 'flow' ? 'Deep' : 'Steady';

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
              Pick one thing to focus on
            </Text>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section 1: Ready for Today (Later items) */}
            {suggestions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionIcon, { color: theme.colors.primary }]}>📌</Text>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Ready for Today
                  </Text>
                  <Text style={[styles.sectionCount, { color: theme.colors.textTertiary }]}>
                    ({suggestions.length})
                  </Text>
                </View>

                {suggestions.map(({ item, reasonText }: ScoredItem) => (
                  <View
                    key={item.id}
                    style={[
                      styles.itemCard,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.borderSubtle,
                      },
                    ]}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                        {item.title}
                      </Text>
                      <View style={styles.itemMeta}>
                        <Text style={[styles.itemDuration, { color: theme.colors.textTertiary }]}>
                          {item.estimatedDuration}
                        </Text>
                        {reasonText && (
                          <>
                            <Text style={[styles.metaDot, { color: theme.colors.textTertiary }]}>
                              •
                            </Text>
                            <Text style={[styles.itemReason, { color: theme.colors.primary }]}>
                              {reasonText}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => onStartLaterItem(item, reasonText)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.startButtonText}>Start</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Divider */}
            {suggestions.length > 0 && filteredPacePicks.length > 0 && (
              <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />
            )}

            {/* Section 2: Pace Picks */}
            {filteredPacePicks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionIcon, { color: theme.colors.primary }]}>✨</Text>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Pace Picks
                  </Text>
                  <Text style={[styles.sectionCount, { color: theme.colors.textTertiary }]}>
                    ({paceLabel})
                  </Text>
                </View>

                {filteredPacePicks.map((pacePick) => (
                  <View
                    key={pacePick.id}
                    style={[
                      styles.itemCard,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.borderSubtle,
                      },
                    ]}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                        {pacePick.title}
                      </Text>
                      {pacePick.estimatedDuration && (
                        <Text style={[styles.itemDuration, { color: theme.colors.textTertiary }]}>
                          {pacePick.estimatedDuration}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => onStartPacePick(pacePick)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.startButtonText}>Start</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Empty state */}
            {suggestions.length === 0 && filteredPacePicks.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No suggestions available
                </Text>
                <Text style={[styles.emptyHint, { color: theme.colors.textTertiary }]}>
                  Add something custom below
                </Text>
              </View>
            )}

            {/* Divider before Add Custom */}
            {(suggestions.length > 0 || filteredPacePicks.length > 0) && (
              <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />
            )}

            {/* Section 3: Add Custom */}
            <TouchableOpacity
              style={styles.addCustomButton}
              onPress={() => {
                onClose();
                onAddCustom();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.addCustomText, { color: theme.colors.textSecondary }]}>
                + Add something custom
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
    maxHeight: '80%',
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 13,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 16,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemDuration: {
    fontSize: 13,
  },
  metaDot: {
    fontSize: 13,
  },
  itemReason: {
    fontSize: 13,
    fontWeight: '500',
  },
  startButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
  emptyHint: {
    fontSize: 13,
  },
  addCustomButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  addCustomText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
