/**
 * weeklyIntentStore.ts
 * Zustand store for weekly intent planning and review.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  WeeklyIntent,
  WeeklyIntentItem,
  createWeeklyIntent,
  createWeeklyIntentItem,
  getWeekStartDate,
  isPlanningDay,
  isWeekOver,
} from '@/src/models/WeeklyIntent';
import { FocusDuration } from '@/src/models/FocusItem';
import { useFocusStore } from './focusStore';
import { useSettingsStore } from './settingsStore';

interface WeeklyIntentStore {
  intents: WeeklyIntent[];
  planningNudgeDismissedForWeek: string | null;
  reviewNudgeDismissedForWeek: string | null;

  // Planning actions
  startPlanning: () => WeeklyIntent;
  addItem: (intentId: string, focusItemId: string, title: string) => void;
  addNewItem: (intentId: string, title: string, duration: FocusDuration) => void;
  removeItem: (intentId: string, itemId: string) => void;
  togglePriority: (intentId: string, itemId: string) => void;
  finalizePlan: (intentId: string) => void;

  // Completion sync
  syncCompletions: () => void;

  // Review actions
  setItemOutcome: (intentId: string, itemId: string, outcome: WeeklyIntentItem['outcome']) => void;
  finalizeReview: (intentId: string, reviewNote?: string) => void;
  rollItemToNextWeek: (intentId: string, itemId: string) => void;

  // Nudge management
  dismissPlanningNudge: () => void;
  dismissReviewNudge: () => void;

  // Queries
  getActiveIntent: () => WeeklyIntent | null;
  shouldShowPlanningNudge: () => boolean;
  shouldShowReviewNudge: () => boolean;

  // Maintenance
  cleanupOldIntents: () => void;
}

export const useWeeklyIntentStore = create<WeeklyIntentStore>()(
  persist(
    (set, get) => ({
      intents: [],
      planningNudgeDismissedForWeek: null,
      reviewNudgeDismissedForWeek: null,

      startPlanning: () => {
        const settings = useSettingsStore.getState().settings;
        const weekStart = getWeekStartDate(new Date(), settings.weeklyPlanningDay);
        const { intents } = get();
        const existing = intents.find((i) => i.weekStartDate === weekStart);

        if (existing) return existing;

        const newIntent = createWeeklyIntent(weekStart);
        set({ intents: [newIntent, ...intents] });
        return newIntent;
      },

      addItem: (intentId, focusItemId, title) => {
        set((state) => ({
          intents: state.intents.map((intent) => {
            if (intent.id !== intentId) return intent;
            // Don't add duplicates
            if (intent.items.some((item) => item.focusItemId === focusItemId)) return intent;
            const newItem = createWeeklyIntentItem(focusItemId, title);
            return { ...intent, items: [...intent.items, newItem] };
          }),
        }));
      },

      addNewItem: (intentId, title, duration) => {
        // Create a new Later item first, then add to intent
        const focusStore = useFocusStore.getState();
        focusStore.addToLater(title, duration);
        // Get the newly created item (last in laterItems)
        const laterItems = useFocusStore.getState().laterItems;
        const newFocusItem = laterItems[laterItems.length - 1];
        if (newFocusItem) {
          get().addItem(intentId, newFocusItem.id, newFocusItem.title);
        }
      },

      removeItem: (intentId, itemId) => {
        set((state) => ({
          intents: state.intents.map((intent) =>
            intent.id === intentId
              ? { ...intent, items: intent.items.filter((item) => item.id !== itemId) }
              : intent
          ),
        }));
      },

      togglePriority: (intentId, itemId) => {
        set((state) => ({
          intents: state.intents.map((intent) =>
            intent.id === intentId
              ? {
                  ...intent,
                  items: intent.items.map((item) =>
                    item.id === itemId ? { ...item, isPriority: !item.isPriority } : item
                  ),
                }
              : intent
          ),
        }));
      },

      finalizePlan: (intentId) => {
        set((state) => ({
          intents: state.intents.map((intent) =>
            intent.id === intentId
              ? { ...intent, status: 'active' as const, activatedAt: new Date().toISOString() }
              : intent
          ),
        }));
      },

      syncCompletions: () => {
        const { intents } = get();
        const activeIntent = intents.find((i) => i.status === 'active');
        if (!activeIntent) return;

        const focusState = useFocusStore.getState();
        const allItems = [...focusState.todayItems, ...focusState.laterItems];
        const completedEntries = focusState.completedToday;

        // Build a set of completed item IDs from both sources
        const completedIds = new Set<string>();
        allItems.forEach((item) => {
          if (item.completedAt) completedIds.add(item.id);
        });
        completedEntries.forEach((entry) => {
          if (entry.sourceItem?.id) completedIds.add(entry.sourceItem.id);
        });

        let changed = false;
        const updatedItems = activeIntent.items.map((item) => {
          if (item.outcome === 'pending' && completedIds.has(item.focusItemId)) {
            changed = true;
            return {
              ...item,
              completedAt: new Date().toISOString(),
              outcome: 'completed' as const,
            };
          }
          return item;
        });

        if (changed) {
          set((state) => ({
            intents: state.intents.map((intent) =>
              intent.id === activeIntent.id ? { ...intent, items: updatedItems } : intent
            ),
          }));
        }
      },

      setItemOutcome: (intentId, itemId, outcome) => {
        set((state) => ({
          intents: state.intents.map((intent) =>
            intent.id === intentId
              ? {
                  ...intent,
                  items: intent.items.map((item) =>
                    item.id === itemId ? { ...item, outcome } : item
                  ),
                }
              : intent
          ),
        }));
      },

      finalizeReview: (intentId, reviewNote) => {
        set((state) => ({
          intents: state.intents.map((intent) =>
            intent.id === intentId
              ? {
                  ...intent,
                  status: 'reviewed' as const,
                  reviewedAt: new Date().toISOString(),
                  reviewNote,
                }
              : intent
          ),
        }));
      },

      rollItemToNextWeek: (intentId, itemId) => {
        const { intents } = get();
        const currentIntent = intents.find((i) => i.id === intentId);
        if (!currentIntent) return;

        const item = currentIntent.items.find((i) => i.id === itemId);
        if (!item) return;

        // Mark as rolled over in current intent
        get().setItemOutcome(intentId, itemId, 'rolled-over');

        // Calculate next week's start date
        const currentEnd = new Date(currentIntent.weekEndDate + 'T00:00:00');
        const nextWeekStart = new Date(currentEnd);
        nextWeekStart.setDate(nextWeekStart.getDate() + 1);
        const nextWeekStartStr = nextWeekStart.toISOString().split('T')[0];

        // Get or create next week's intent
        const updatedIntents = get().intents;
        let nextIntent = updatedIntents.find((i) => i.weekStartDate === nextWeekStartStr);
        if (!nextIntent) {
          nextIntent = createWeeklyIntent(nextWeekStartStr);
          set((state) => ({ intents: [nextIntent!, ...state.intents] }));
        }

        // Add the item to next week
        get().addItem(nextIntent.id, item.focusItemId, item.titleSnapshot);
      },

      dismissPlanningNudge: () => {
        const settings = useSettingsStore.getState().settings;
        const weekStart = getWeekStartDate(new Date(), settings.weeklyPlanningDay);
        set({ planningNudgeDismissedForWeek: weekStart });
      },

      dismissReviewNudge: () => {
        const settings = useSettingsStore.getState().settings;
        const weekStart = getWeekStartDate(new Date(), settings.weeklyPlanningDay);
        set({ reviewNudgeDismissedForWeek: weekStart });
      },

      getActiveIntent: () => {
        const { intents } = get();
        return intents.find((i) => i.status === 'active' || i.status === 'planning') || null;
      },

      shouldShowPlanningNudge: () => {
        const settings = useSettingsStore.getState().settings;
        if (!settings.weeklyIntentEnabled) return false;

        const { intents, planningNudgeDismissedForWeek } = get();
        const weekStart = getWeekStartDate(new Date(), settings.weeklyPlanningDay);

        // Already dismissed for this week
        if (planningNudgeDismissedForWeek === weekStart) return false;

        // Already have an intent for this week
        if (intents.some((i) => i.weekStartDate === weekStart)) return false;

        return isPlanningDay(settings.weeklyPlanningDay);
      },

      shouldShowReviewNudge: () => {
        const settings = useSettingsStore.getState().settings;
        if (!settings.weeklyIntentEnabled) return false;

        const { intents, reviewNudgeDismissedForWeek } = get();
        const weekStart = getWeekStartDate(new Date(), settings.weeklyPlanningDay);

        // Already dismissed for this week
        if (reviewNudgeDismissedForWeek === weekStart) return false;

        // Find the active intent and check if the week is ending
        const activeIntent = intents.find((i) => i.status === 'active');
        if (!activeIntent) return false;

        return isWeekOver(activeIntent);
      },

      cleanupOldIntents: () => {
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
        const cutoff = eightWeeksAgo.toISOString().split('T')[0];

        set((state) => ({
          intents: state.intents.filter((i) => i.weekStartDate >= cutoff),
        }));
      },
    }),
    {
      name: 'weekly-intent-storage',
    }
  )
);
