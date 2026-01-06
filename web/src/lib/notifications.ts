/**
 * Web Notifications API wrapper
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendTaskTransitionNotification(
  currentTaskName: string,
  nextTaskName: string
): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  new Notification('Task Complete', {
    body: `${currentTaskName} complete! Moving to: ${nextTaskName}`,
    icon: '/favicon.ico',
    tag: 'just-today-task-transition',
    requireInteraction: false,
  });
}

export function sendRoutineCompleteNotification(): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  new Notification('Routine Complete', {
    body: 'All tasks completed!',
    icon: '/favicon.ico',
    tag: 'just-today-routine-complete',
    requireInteraction: false,
  });
}
