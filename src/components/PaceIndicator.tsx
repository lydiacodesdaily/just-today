/**
 * PaceIndicator.tsx
 * A small, subtle pill showing current pace with option to change.
 *
 * Designed to be compact and non-intrusive - not competing with Today's Focus.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useTheme } from '../constants/theme';
import { usePace } from '../context/PaceContext';
import { Pace } from '../models/RoutineTemplate';

// Map internal storage keys to user-facing pace labels
const PACE_CONFIG: Record<Pace, { icon: string; label: string }> = {
  low: { icon: '💤', label: 'Gentle' },
  steady: { icon: '🌿', label: 'Steady' },
  flow: { icon: '✨', label: 'Deep' },
};

const ALL_PACES: Pace[] = ['low', 'steady', 'flow'];

export function PaceIndicator() {
  const theme = useTheme();
  const { currentPace, setPaceForToday } = usePace();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const config = PACE_CONFIG[currentPace];

  // Get pace-specific colors
  const getPaceColors = (pace: Pace) => {
    switch (pace) {
      case 'low':
        return { color: theme.colors.energyCare, bgColor: theme.colors.energyCareSubtle };
      case 'steady':
        return { color: theme.colors.energySteady, bgColor: theme.colors.energySteadySubtle };
      case 'flow':
        return { color: theme.colors.energyFlow, bgColor: theme.colors.energyFlowSubtle };
    }
  };

  const currentColors = getPaceColors(currentPace);

  const handleSelect = async (pace: Pace) => {
    await setPaceForToday(pace);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Pill button */}
      <TouchableOpacity
        style={[
          styles.pill,
          {
            backgroundColor: currentColors.bgColor,
            borderColor: currentColors.color,
          },
        ]}
        onPress={() => setIsModalOpen(true)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Today's pace: ${config.label}. Tap to change.`}
      >
        <Text style={styles.pillIcon}>{config.icon}</Text>
        <Text style={[styles.pillLabel, { color: currentColors.color }]}>
          {config.label}
        </Text>
        <Text style={[styles.pillChange, { color: theme.colors.textSecondary }]}>
          Change
        </Text>
      </TouchableOpacity>

      {/* Modal selector */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalOpen(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Today's Pace
            </Text>

            {ALL_PACES.map((pace) => {
              const paceConfig = PACE_CONFIG[pace];
              const paceColors = getPaceColors(pace);
              const isSelected = pace === currentPace;

              return (
                <TouchableOpacity
                  key={pace}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor: isSelected ? paceColors.bgColor : 'transparent',
                      borderColor: isSelected ? paceColors.color : theme.colors.borderSubtle,
                    },
                  ]}
                  onPress={() => handleSelect(pace)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalOptionIcon}>{paceConfig.icon}</Text>
                  <Text style={[styles.modalOptionLabel, { color: theme.colors.text }]}>
                    {paceConfig.label}
                  </Text>
                  {isSelected && (
                    <Text style={[styles.modalOptionCheck, { color: paceColors.color }]}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setIsModalOpen(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalCancelText, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  pillIcon: {
    fontSize: 16,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillChange: {
    fontSize: 12,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  modalOptionIcon: {
    fontSize: 24,
  },
  modalOptionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOptionCheck: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 15,
  },
});
