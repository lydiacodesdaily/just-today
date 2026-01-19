/**
 * CheckOncePicker.tsx
 * Picker for selecting a "check once later" date - one-time resurfacing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../constants/theme';
import { CheckOncePreset, calculateCheckOnceDate } from '../models/FocusItem';

interface CheckOncePickerProps {
  visible: boolean;
  onConfirm: (checkOnceDate: string) => void;
  onCancel: () => void;
}

const PRESET_OPTIONS: { value: CheckOncePreset; label: string; description: string }[] = [
  { value: 'few-days', label: 'In a few days', description: '3 days from now' },
  { value: 'next-week', label: 'Next week', description: '7 days from now' },
  { value: 'two-weeks', label: 'In two weeks', description: '14 days from now' },
  { value: 'custom', label: 'Pick a date', description: 'Choose your own date' },
];

export function CheckOncePicker({ visible, onConfirm, onCancel }: CheckOncePickerProps) {
  const theme = useTheme();
  const [selectedPreset, setSelectedPreset] = useState<CheckOncePreset | null>(null);
  const [customDate, setCustomDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handlePresetSelect = (preset: CheckOncePreset) => {
    setSelectedPreset(preset);
    if (preset === 'custom') {
      setShowDatePicker(true);
    }
  };

  const handleDateChange = (_event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setCustomDate(date);
    }
  };

  const handleConfirm = () => {
    if (!selectedPreset) return;

    const checkOnceDate = calculateCheckOnceDate(
      selectedPreset,
      selectedPreset === 'custom' ? customDate : undefined
    );

    if (checkOnceDate) {
      onConfirm(checkOnceDate);
    }
  };

  const canConfirm = selectedPreset && (selectedPreset !== 'custom' || customDate);

  const handleClose = () => {
    setSelectedPreset(null);
    setShowDatePicker(false);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Check back once
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            We'll resurface this once. No reminders.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {PRESET_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor:
                    selectedPreset === option.value
                      ? theme.colors.text
                      : theme.colors.border,
                  borderWidth: selectedPreset === option.value ? 2 : 1,
                },
              ]}
              onPress={() => handlePresetSelect(option.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                {option.label}
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Custom date picker (iOS inline, Android modal) */}
          {selectedPreset === 'custom' && Platform.OS === 'ios' && (
            <View style={[styles.datePickerContainer, { backgroundColor: theme.colors.surface }]}>
              <DateTimePicker
                value={customDate}
                mode="date"
                display="inline"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            </View>
          )}

          {/* Android date picker modal */}
          {showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={customDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[
              styles.footerButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.footerButtonText, { color: theme.colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.footerButton,
              {
                backgroundColor: canConfirm ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={handleConfirm}
            disabled={!canConfirm}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.footerButtonText,
                { color: canConfirm ? '#FFFFFF' : theme.colors.textTertiary },
              ]}
            >
              Set check
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  options: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  datePickerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 34, // Safe area
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
