/**
 * WeeklyIntentContext.tsx
 * Context provider for weekly intent planning and review.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import {
  WeeklyIntent,
  WeeklyIntentItem,
  getWeekStartDate,
  isPlanningDay,
  isWeekOver,
} from '../models/WeeklyIntent';
import { FocusDuration } from '../models/FocusItem';
import {
  getActiveIntent as persistGetActiveIntent,
  getAllIntents,
  getOrCreateIntent,
  addItemToIntent as persistAddItem,
  removeItemFromIntent as persistRemoveItem,
  toggleItemPriority as persistTogglePriority,
  activateIntent as persistActivateIntent,
  setItemOutcome as persistSetItemOutcome,
  finalizeReview as persistFinalizeReview,
  syncCompletionsWithFocusItems,
  cleanupOldIntents,
} from '../persistence/weeklyIntentStore';
import { useFocus } from './FocusContext';
import { useSettings } from './SettingsContext';

interface WeeklyIntentContextValue {
  currentIntent: WeeklyIntent | null;
  pastIntents: WeeklyIntent[];
  isLoading: boolean;

  // Planning actions
  startPlanning: () => Promise<WeeklyIntent>;
  addItem: (focusItemId: string, title: string) => Promise<void>;
  addNewItem: (title: string, duration: FocusDuration) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  togglePriority: (itemId: string) => Promise<void>;
  finalizePlan: () => Promise<void>;

  // Review actions
  setItemOutcome: (itemId: string, outcome: WeeklyIntentItem['outcome']) => Promise<void>;
  finalizeReview: (reviewNote?: string) => Promise<void>;
  rollItemToNextWeek: (itemId: string) => Promise<void>;

  // Nudge state
  shouldShowPlanningNudge: boolean;
  shouldShowReviewNudge: boolean;
  dismissPlanningNudge: () => void;
  dismissReviewNudge: () => void;

  refreshIntents: () => Promise<void>;
}

const WeeklyIntentContext = createContext<WeeklyIntentContextValue | undefined>(undefined);

export function WeeklyIntentProvider({ children }: { children: ReactNode }) {
  const [currentIntent, setCurrentIntent] = useState<WeeklyIntent | null>(null);
  const [pastIntents, setPastIntents] = useState<WeeklyIntent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [planningNudgeDismissed, setPlanningNudgeDismissed] = useState(false);
  const [reviewNudgeDismissed, setReviewNudgeDismissed] = useState(false);

  const { todayItems, laterItems, addToLater } = useFocus();
  const { settings } = useSettings();

  const loadIntents = useCallback(async () => {
    setIsLoading(true);
    try {
      const allIntents = await getAllIntents();
      const active = allIntents.find((i) => i.status === 'active' || i.status === 'planning') || null;
      const past = allIntents.filter((i) => i.status === 'reviewed');
      setCurrentIntent(active);
      setPastIntents(past);
    } catch (error) {
      console.error('Failed to load weekly intents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntents();
  }, [loadIntents]);

  // Sync completions periodically
  useEffect(() => {
    if (!currentIntent || currentIntent.status !== 'active') return;

    const allItems = [...todayItems, ...laterItems];
    syncCompletionsWithFocusItems(allItems).then((changed) => {
      if (changed) loadIntents();
    });
  }, [todayItems, laterItems, currentIntent, loadIntents]);

  // Cleanup old intents on mount
  useEffect(() => {
    cleanupOldIntents();
  }, []);

  const startPlanning = useCallback(async (): Promise<WeeklyIntent> => {
    const weekStart = getWeekStartDate(new Date(), settings.weeklyPlanningDay);
    const intent = await getOrCreateIntent(weekStart);
    setCurrentIntent(intent);
    return intent;
  }, [settings.weeklyPlanningDay]);

  const addItem = useCallback(async (focusItemId: string, title: string): Promise<void> => {
    if (!currentIntent) return;
    await persistAddItem(currentIntent.id, focusItemId, title);
    await loadIntents();
  }, [currentIntent, loadIntents]);

  const addNewItem = useCallback(async (title: string, duration: FocusDuration): Promise<void> => {
    if (!currentIntent) return;
    const newFocusItem = await addToLater(title, duration);
    await persistAddItem(currentIntent.id, newFocusItem.id, newFocusItem.title);
    await loadIntents();
  }, [currentIntent, addToLater, loadIntents]);

  const removeItem = useCallback(async (itemId: string): Promise<void> => {
    if (!currentIntent) return;
    await persistRemoveItem(currentIntent.id, itemId);
    await loadIntents();
  }, [currentIntent, loadIntents]);

  const togglePriority = useCallback(async (itemId: string): Promise<void> => {
    if (!currentIntent) return;
    await persistTogglePriority(currentIntent.id, itemId);
    await loadIntents();
  }, [currentIntent, loadIntents]);

  const finalizePlan = useCallback(async (): Promise<void> => {
    if (!currentIntent) return;
    await persistActivateIntent(currentIntent.id);
    await loadIntents();
  }, [currentIntent, loadIntents]);

  const setItemOutcome = useCallback(async (itemId: string, outcome: WeeklyIntentItem['outcome']): Promise<void> => {
    if (!currentIntent) return;
    await persistSetItemOutcome(currentIntent.id, itemId, outcome);
    await loadIntents();
  }, [currentIntent, loadIntents]);

  const finalizeReviewFn = useCallback(async (reviewNote?: string): Promise<void> => {
    if (!currentIntent) return;
    await persistFinalizeReview(currentIntent.id, reviewNote);
    await loadIntents();
  }, [currentIntent, loadIntents]);

  const rollItemToNextWeek = useCallback(async (itemId: string): Promise<void> => {
    if (!currentIntent) return;

    const item = currentIntent.items.find((i) => i.id === itemId);
    if (!item) return;

    // Mark as rolled over
    await persistSetItemOutcome(currentIntent.id, itemId, 'rolled-over');

    // Create next week's intent and add the item
    const currentEnd = new Date(currentIntent.weekEndDate + 'T00:00:00');
    const nextWeekStart = new Date(currentEnd);
    nextWeekStart.setDate(nextWeekStart.getDate() + 1);
    const nextWeekStartStr = nextWeekStart.toISOString().split('T')[0];

    const nextIntent = await getOrCreateIntent(nextWeekStartStr);
    await persistAddItem(nextIntent.id, item.focusItemId, item.titleSnapshot);
    await loadIntents();
  }, [currentIntent, loadIntents]);

  const shouldShowPlanningNudge = useMemo(() => {
    if (!settings.weeklyIntentEnabled || planningNudgeDismissed) return false;
    if (currentIntent) return false;
    return isPlanningDay(settings.weeklyPlanningDay);
  }, [settings.weeklyIntentEnabled, settings.weeklyPlanningDay, planningNudgeDismissed, currentIntent]);

  const shouldShowReviewNudge = useMemo(() => {
    if (!settings.weeklyIntentEnabled || reviewNudgeDismissed) return false;
    if (!currentIntent || currentIntent.status !== 'active') return false;
    return isWeekOver(currentIntent);
  }, [settings.weeklyIntentEnabled, reviewNudgeDismissed, currentIntent]);

  const dismissPlanningNudge = useCallback(() => {
    setPlanningNudgeDismissed(true);
  }, []);

  const dismissReviewNudge = useCallback(() => {
    setReviewNudgeDismissed(true);
  }, []);

  const value: WeeklyIntentContextValue = useMemo(
    () => ({
      currentIntent,
      pastIntents,
      isLoading,
      startPlanning,
      addItem,
      addNewItem,
      removeItem,
      togglePriority,
      finalizePlan,
      setItemOutcome,
      finalizeReview: finalizeReviewFn,
      rollItemToNextWeek,
      shouldShowPlanningNudge,
      shouldShowReviewNudge,
      dismissPlanningNudge,
      dismissReviewNudge,
      refreshIntents: loadIntents,
    }),
    [
      currentIntent,
      pastIntents,
      isLoading,
      startPlanning,
      addItem,
      addNewItem,
      removeItem,
      togglePriority,
      finalizePlan,
      setItemOutcome,
      finalizeReviewFn,
      rollItemToNextWeek,
      shouldShowPlanningNudge,
      shouldShowReviewNudge,
      dismissPlanningNudge,
      dismissReviewNudge,
      loadIntents,
    ]
  );

  return <WeeklyIntentContext.Provider value={value}>{children}</WeeklyIntentContext.Provider>;
}

export function useWeeklyIntent(): WeeklyIntentContextValue {
  const context = useContext(WeeklyIntentContext);
  if (!context) {
    throw new Error('useWeeklyIntent must be used within a WeeklyIntentProvider');
  }
  return context;
}
