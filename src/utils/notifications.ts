/**
 * notifications.ts
 * Local notification utilities for task transitions.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Configures notification behavior.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Requests notification permissions.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Sends a local notification for task completion.
 */
export async function sendTaskTransitionNotification(
  completedTaskName: string,
  nextTaskName: string
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${completedTaskName} is complete`,
        body: `Time to move on to ${nextTaskName}`,
        sound: true,
      },
      trigger: null, // Immediate notification
    });
  } catch (error) {
    console.warn('Failed to send notification:', error);
  }
}

/**
 * Sends a completion notification when all tasks are done.
 */
export async function sendRoutineCompleteNotification(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'You did it!',
        body: 'Your routine is complete. Well done.',
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.warn('Failed to send notification:', error);
  }
}

/**
 * Sends a notification for time milestones during a task.
 */
export async function sendTimeMilestoneNotification(
  taskName: string,
  minutesPassed: number
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${minutesPassed} minutes on ${taskName}`,
        body: "You're doing fine. Keep going at your own pace.",
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.warn('Failed to send notification:', error);
  }
}
