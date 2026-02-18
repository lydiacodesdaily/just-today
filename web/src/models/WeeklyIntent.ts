/**
 * WeeklyIntent.ts
 * Data model for weekly planning ritual.
 * Users select items for the week, mark priorities, and share progress with friends.
 */

/** Day of the week (0=Sunday, 1=Monday, ..., 6=Saturday) */
export type PlanningDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * A snapshot of a FocusItem added to a weekly intent.
 * focusItemId links to the live item for completion tracking.
 * titleSnapshot ensures readability even if the item is deleted.
 */
export interface WeeklyIntentItem {
  id: string;
  focusItemId: string;
  titleSnapshot: string;
  isPriority: boolean;
  addedAt: string;
  completedAt?: string;
  outcome: 'pending' | 'completed' | 'rolled-over' | 'returned-to-later';
}

export type WeeklyIntentStatus = 'planning' | 'active' | 'reviewed';

export interface WeeklyIntent {
  id: string;
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string; // YYYY-MM-DD
  status: WeeklyIntentStatus;
  items: WeeklyIntentItem[];
  createdAt: string;
  activatedAt?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export function createWeeklyIntent(weekStartDate: string): WeeklyIntent {
  const randomId = Math.random().toString(36).substr(2, 9);
  const start = new Date(weekStartDate + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return {
    id: `weekly-${Date.now()}-${randomId}`,
    weekStartDate,
    weekEndDate: end.toISOString().split('T')[0],
    status: 'planning',
    items: [],
    createdAt: new Date().toISOString(),
  };
}

export function createWeeklyIntentItem(
  focusItemId: string,
  title: string
): WeeklyIntentItem {
  const randomId = Math.random().toString(36).substr(2, 9);
  return {
    id: `wi-item-${Date.now()}-${randomId}`,
    focusItemId,
    titleSnapshot: title,
    isPriority: false,
    addedAt: new Date().toISOString(),
    outcome: 'pending',
  };
}

/**
 * Get the start date of the week containing the given date,
 * based on the user's planning day preference.
 */
export function getWeekStartDate(date: Date, planningDay: PlanningDay = 1): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const currentDay = d.getDay();
  const diff = (currentDay - planningDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

export function isPlanningDay(planningDay: PlanningDay = 1): boolean {
  return new Date().getDay() === planningDay;
}

export function isWeekOver(intent: WeeklyIntent): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(intent.weekEndDate + 'T00:00:00');
  return today > endDate;
}

export const PLANNING_DAY_LABELS: Record<PlanningDay, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

function formatWeekRange(weekStartDate: string, weekEndDate: string): string {
  const start = new Date(weekStartDate + 'T00:00:00');
  const end = new Date(weekEndDate + 'T00:00:00');
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
}

export function generatePlanSummary(intent: WeeklyIntent): string {
  const range = formatWeekRange(intent.weekStartDate, intent.weekEndDate);
  const priorityItems = intent.items.filter((i) => i.isPriority);
  const otherItems = intent.items.filter((i) => !i.isPriority);

  let text = `My week (${range})\n`;

  if (priorityItems.length > 0) {
    text += `\nTop priorities:\n`;
    priorityItems.forEach((i) => {
      text += ` ★ ${i.titleSnapshot}\n`;
    });
  }

  if (otherItems.length > 0) {
    text += `\nAlso this week:\n`;
    otherItems.forEach((i) => {
      text += ` · ${i.titleSnapshot}\n`;
    });
  }

  return text.trim();
}

export function generateReviewSummary(intent: WeeklyIntent): string {
  const range = formatWeekRange(intent.weekStartDate, intent.weekEndDate);
  const completed = intent.items.filter((i) => i.outcome === 'completed');
  const rolledOver = intent.items.filter((i) => i.outcome === 'rolled-over');
  const returnedToLater = intent.items.filter((i) => i.outcome === 'returned-to-later');
  const pending = intent.items.filter((i) => i.outcome === 'pending');

  let text = `Week in Review (${range})\n`;

  if (completed.length > 0) {
    text += `\nCompleted:\n`;
    completed.forEach((i) => {
      text += ` ✓ ${i.titleSnapshot}\n`;
    });
  }

  if (rolledOver.length > 0) {
    text += `\nCarrying forward:\n`;
    rolledOver.forEach((i) => {
      text += ` → ${i.titleSnapshot}\n`;
    });
  }

  if (returnedToLater.length > 0) {
    text += `\nBack to Later:\n`;
    returnedToLater.forEach((i) => {
      text += ` ~ ${i.titleSnapshot}\n`;
    });
  }

  if (pending.length > 0) {
    text += `\nStill pending:\n`;
    pending.forEach((i) => {
      text += ` · ${i.titleSnapshot}\n`;
    });
  }

  if (intent.reviewNote) {
    text += `\n${intent.reviewNote}\n`;
  }

  return text.trim();
}
