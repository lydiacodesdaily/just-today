/**
 * onboardingStore.ts
 * Persistence layer for onboarding state
 */

import { getItem, setItem } from './storage';
import {
  OnboardingState,
  DEFAULT_ONBOARDING_STATE,
  HintId,
} from '../models/Onboarding';

const ONBOARDING_KEY = '@just-today/onboarding';

export async function loadOnboardingState(): Promise<OnboardingState> {
  const state = await getItem<OnboardingState>(ONBOARDING_KEY);
  if (!state) {
    // First launch - record it
    const newState = {
      ...DEFAULT_ONBOARDING_STATE,
      firstLaunchDate: new Date().toISOString(),
    };
    await saveOnboardingState(newState);
    return newState;
  }
  return state;
}

export async function saveOnboardingState(
  state: OnboardingState
): Promise<void> {
  await setItem(ONBOARDING_KEY, state);
}

// ===== Hint/Coach Mark Management =====

export async function dismissHint(hintId: HintId): Promise<void> {
  const state = await loadOnboardingState();
  if (!state.dismissedHints.includes(hintId)) {
    state.dismissedHints.push(hintId);
    await saveOnboardingState(state);
  }
}

export async function isHintDismissed(hintId: HintId): Promise<boolean> {
  const state = await loadOnboardingState();
  return state.dismissedHints.includes(hintId);
}

// ===== Usage Tracking =====

export async function trackTodayItemCreated(): Promise<void> {
  const state = await loadOnboardingState();
  state.usage.todayItemsCreated += 1;
  trackDayActive(state);
  await saveOnboardingState(state);
}

export async function trackLaterItemCreated(): Promise<void> {
  const state = await loadOnboardingState();
  state.usage.laterItemsCreated += 1;
  trackDayActive(state);
  await saveOnboardingState(state);
}

export async function trackBrainDumpEntry(charCount: number): Promise<void> {
  const state = await loadOnboardingState();
  state.usage.brainDumpEntriesCreated += 1;
  state.usage.brainDumpCharsTyped += charCount;
  await saveOnboardingState(state);
}

export async function trackGuideOpened(): Promise<void> {
  const state = await loadOnboardingState();
  state.usage.guidesOpened += 1;
  await saveOnboardingState(state);
}

export async function trackCustomGuideCreated(): Promise<void> {
  const state = await loadOnboardingState();
  state.usage.customGuidesCreated += 1;
  await saveOnboardingState(state);
}

function trackDayActive(state: OnboardingState): void {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  if (!state.usage.daysActive.includes(today)) {
    state.usage.daysActive.push(today);
  }
}

// ===== Visibility Logic for Examples/Helpers =====

export async function shouldShowTodayExamples(): Promise<boolean> {
  const state = await loadOnboardingState();
  const totalTasks = state.usage.todayItemsCreated + state.usage.laterItemsCreated;
  return totalTasks < 3 && state.usage.daysActive.length < 2;
}

export async function shouldShowLaterExamples(): Promise<boolean> {
  const state = await loadOnboardingState();
  const totalTasks = state.usage.todayItemsCreated + state.usage.laterItemsCreated;
  return totalTasks < 3 && state.usage.daysActive.length < 2;
}

export async function shouldShowBrainDumpExample(): Promise<boolean> {
  const state = await loadOnboardingState();
  return state.usage.brainDumpEntriesCreated < 2 && state.usage.brainDumpCharsTyped < 200;
}

export async function shouldShowGuidesHelper(): Promise<boolean> {
  const state = await loadOnboardingState();
  if (await isHintDismissed('guides-coach-mark')) return false;
  return state.usage.guidesOpened < 2 && state.usage.customGuidesCreated < 1;
}

export async function resetOnboarding(): Promise<void> {
  await saveOnboardingState(DEFAULT_ONBOARDING_STATE);
}
