/**
 * EditTodayItemModal.tsx
 * Modal for editing Today items - title and duration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { useTheme } from '../constants/theme';
import { FocusItem, FocusDuration } from '../models/FocusItem';
import { useFocus } from '../context/FocusContext';

interface EditTodayItemModalProps {
  item: FocusItem;
  visible: boolean;
  onClose: () => void;
}

const DURATIONS: FocusDuration[] = [
  '~5 min',
  '~10 min',
  '~15 min',
  '~25 min',
  '~30 min',
  '~45 min',
  '~1 hour',
  '~2 hours',
];

export function EditTodayItemModal({ item, visible, onClose }: EditTodayItemModalProps) {
  const theme = useTheme();
  const { updateTodayItem } = useFocus();

  const [title, setTitle] = useState(item.title);
  const [duration, setDuration] = useState<FocusDuration>(item.estimatedDuration);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    await updateTodayItem(item.id, title.trim(), duration);
    onClose();
  };

  const showDurationPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...DURATIONS],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setDuration(DURATIONS[buttonIndex - 1]);
          }
        }
      );
    } else {
      Alert.alert(
        'Select Duration',
        undefined,
        [
          ...DURATIONS.map((dur) => ({
            text: dur,
            onPress: () => setDuration(dur),
          })),
          { text: 'Cancel', style: 'cancel' as const },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Edit Task
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Task</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={theme.colors.textTertiary}
              autoFocus
            />
          </View>

          {/* Duration Picker */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Estimated Duration</Text>
            <Text style={[styles.hint, { color: theme.colors.textTertiary }]}>
              Think about how long this usually takes, then add a little buffer
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={showDurationPicker}
            >
              <Text style={[styles.pickerButtonText, { color: theme.colors.text }]}>
                {duration}
              </Text>
              <Text style={[styles.chevron, { color: theme.colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 17,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  hint: {
    fontSize: 13,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },
});
