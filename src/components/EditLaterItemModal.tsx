/**
 * EditLaterItemModal.tsx
 * Modal for editing Later items - title, duration, and time bucket
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
import { FocusItem, FocusDuration, TimeBucket, formatTimeBucket } from '../models/FocusItem';
import { useFocus } from '../context/FocusContext';

interface EditLaterItemModalProps {
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

const TIME_BUCKETS: { value: TimeBucket; label: string }[] = [
  { value: 'NONE', label: 'None (clear)' },
  { value: 'TOMORROW', label: 'Tomorrow' },
  { value: 'THIS_WEEKEND', label: 'This Weekend' },
  { value: 'NEXT_WEEK', label: 'Next Week' },
  { value: 'LATER_THIS_MONTH', label: 'Later This Month' },
  { value: 'SOMEDAY', label: 'Someday' },
];

export function EditLaterItemModal({ item, visible, onClose }: EditLaterItemModalProps) {
  const theme = useTheme();
  const { updateLaterItem } = useFocus();

  const [title, setTitle] = useState(item.title);
  const [duration, setDuration] = useState<FocusDuration>(item.estimatedDuration);
  const [timeBucket, setTimeBucket] = useState<TimeBucket | undefined>(item.timeBucket);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    await updateLaterItem(
      item.id,
      title.trim(),
      duration,
      timeBucket === 'NONE' ? undefined : timeBucket
    );
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

  const showTimeBucketPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...TIME_BUCKETS.map((b) => b.label)],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setTimeBucket(TIME_BUCKETS[buttonIndex - 1].value);
          }
        }
      );
    } else {
      Alert.alert(
        'When to think about this?',
        undefined,
        [
          ...TIME_BUCKETS.map((bucket) => ({
            text: bucket.label,
            onPress: () => setTimeBucket(bucket.value),
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
            Edit Item
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

          {/* Time Bucket Picker */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              When to think about this?{' '}
              <Text style={[styles.optional, { color: theme.colors.textTertiary }]}>
                (optional)
              </Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={showTimeBucketPicker}
            >
              <Text style={[styles.pickerButtonText, { color: theme.colors.text }]}>
                {timeBucket && timeBucket !== 'NONE'
                  ? formatTimeBucket(timeBucket)
                  : 'None'}
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
  optional: {
    fontSize: 13,
    fontWeight: '400',
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
