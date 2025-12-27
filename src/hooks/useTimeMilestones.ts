/**
 * useTimeMilestones.ts
 * Hook to announce time milestones during a task at configurable intervals.
 * Supports both 1-minute and 5-minute intervals based on settings.
 */

import { useEffect } from 'react';
import { RunTask } from '../models/RoutineRun';
import { TimeRemaining } from '../engine/timerEngine';
import { MilestoneInterval } from '../models/Settings';
import { getTimeMilestoneMessage } from '../utils/transitionMessages';
import { sendTimeMilestoneNotification } from '../utils/notifications';
import { speak } from '../audio/ttsEngine';

interface UseTimeMilestonesProps {
  activeTask: RunTask | null;
  timeRemaining: TimeRemaining | null;
  isPaused: boolean;
  milestoneInterval: MilestoneInterval;
  onMilestoneAnnounced: (minutes: number) => void;
}

/**
 * Monitors elapsed time and announces milestones at configured intervals.
 * Sends both voice announcements and notifications.
 */
export function useTimeMilestones({
  activeTask,
  timeRemaining,
  isPaused,
  milestoneInterval,
  onMilestoneAnnounced,
}: UseTimeMilestonesProps): void {
  useEffect(() => {
    if (!activeTask || !timeRemaining || isPaused) {
      return;
    }

    // Calculate elapsed time in minutes
    const elapsedMs = activeTask.startedAt
      ? Date.now() - activeTask.startedAt
      : 0;
    const elapsedMinutes = Math.floor(elapsedMs / 60000);

    // Calculate current milestone based on interval
    const currentMilestone = Math.floor(elapsedMinutes / milestoneInterval) * milestoneInterval;

    // Only announce if:
    // 1. We've reached a milestone (multiple of interval minutes)
    // 2. We haven't announced this milestone yet
    // 3. At least one interval has passed
    if (
      currentMilestone >= milestoneInterval &&
      elapsedMinutes >= currentMilestone &&
      !activeTask.milestoneAnnouncedMinutes.includes(currentMilestone)
    ) {
      const message = getTimeMilestoneMessage(activeTask.name, currentMilestone);

      // Send voice announcement
      speak(message.ttsMessage);

      // Send notification
      sendTimeMilestoneNotification(activeTask.name, currentMilestone);

      // Mark this milestone as announced
      onMilestoneAnnounced(currentMilestone);
    }
  }, [activeTask, timeRemaining, isPaused, milestoneInterval, onMilestoneAnnounced]);
}
